import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

// 初始化Prisma客户端
const prisma = new PrismaClient();

// Prisma类型到Drizzle类型的映射
const typeMap: Record<string, string> = {
  String: 'varchar',
  Int: 'int',
  Float: 'float',
  Boolean: 'boolean',
  DateTime: 'timestamp',
  BigInt: 'bigint',
  Decimal: 'decimal',
  Json: 'json',
  Bytes: 'blob',
};

// 将Prisma模型定义转换为Drizzle模型定义
async function generateDrizzleSchema() {
  try {
    console.log('正在生成Drizzle模型...');
    
    // 获取Prisma元数据
    const dmmf = (prisma as any)._baseDmmf;
    
    // 创建输出目录
    const outputDir = path.resolve(__dirname, '../db');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // 创建主索引文件
    let indexContent = `import { drizzle } from 'drizzle-orm/mysql2';\nimport mysql from 'mysql2/promise';\nimport { config } from '../config';\n\n`;
    indexContent += `// 导入模型\n`;
    
    // 为每个模型生成Drizzle定义
    dmmf.modelMap.forEach((model: any) => {
      console.log(`处理模型: ${model.name}`);
      
      // 生成模型文件内容
      let fileContent = `import { mysqlTable, int, varchar, timestamp, boolean, primaryKey, foreignKey, index } from 'drizzle-orm/mysql-core';\n\n`;
      
      // 添加模型定义
      fileContent += `export const ${model.name.toLowerCase()} = mysqlTable('${model.name.toLowerCase()}', {\n`;
      
      // 添加字段定义
      model.fields.forEach((field: any) => {
        // 处理ID字段
        if (field.name === 'id' && field.isId) {
          fileContent += `  ${field.name}: int('${field.name}').primaryKey().autoincrement(),\n`;
          return;
        }
        
        // 处理普通字段
        let drizzleType = typeMap[field.type] || 'varchar';
        let fieldDefinition = '';
        
        switch (drizzleType) {
          case 'varchar':
            fieldDefinition = `varchar('${field.name}'${field.isRequired ? '' : '.nullable()'})`;
            if (field.isUnique) fieldDefinition += '.unique()';
            break;
          case 'int':
            fieldDefinition = `int('${field.name}'${field.isRequired ? '' : '.nullable()'})`;
            if (field.isUnique) fieldDefinition += '.unique()';
            break;
          case 'float':
            fieldDefinition = `float('${field.name}'${field.isRequired ? '' : '.nullable()'})`;
            break;
          case 'boolean':
            fieldDefinition = `boolean('${field.name}'${field.isRequired ? '' : '.nullable()'})`;
            break;
          case 'timestamp':
            fieldDefinition = `timestamp('${field.name}'${field.isRequired ? '' : '.nullable()'})`;
            if (field.name === 'createdAt') fieldDefinition += '.defaultNow()';
            break;
          case 'json':
            fieldDefinition = `json('${field.name}'${field.isRequired ? '' : '.nullable()'})`;
            break;
          default:
            fieldDefinition = `varchar('${field.name}'${field.isRequired ? '' : '.nullable()'})`;
        }
        
        // 处理默认值
        if (field.default && field.name !== 'createdAt') {
          const defaultValue = typeof field.default === 'string' 
            ? `'${field.default}'`
            : field.default;
          fieldDefinition += `.default(${defaultValue})`;
        }
        
        fileContent += `  ${field.name}: ${fieldDefinition},\n`;
      });
      
      // 添加关系字段
      fileContent += `});\n\n`;
      
      // 添加关系定义
      const hasRelations = model.fields.some((field: any) => field.relationName);
      if (hasRelations) {
        fileContent += `// 关系定义\n`;
        
        model.fields.forEach((field: any) => {
          if (field.relationName) {
            const relatedModel = field.type;
            const relatedModelLower = relatedModel.toLowerCase();
            const relationKey = field.relationFromFields && field.relationFromFields[0] || 'id';
            const relationForeignKey = field.relationToFields && field.relationToFields[0] || 'id';
            
            if (field.isList) {
              fileContent += `// ${model.name} 一对多 ${relatedModel}\n`;
              fileContent += `// 使用 ${relatedModelLower}Relations 获取关联的 ${relatedModel} 列表\n`;
            } else {
              fileContent += `// ${model.name} 多对一 ${relatedModel}\n`;
              fileContent += `// 外键: ${relationKey} -> ${relatedModelLower}.${relationForeignKey}\n`;
            }
          }
        });
        
        fileContent += `\n`;
      }
      
      // 添加查询辅助函数
      fileContent += `// 查询辅助函数\nexport const ${model.name.toLowerCase()}Relations = {\n`;
      
      model.fields.forEach((field: any) => {
        if (field.relationName) {
          const relatedModel = field.type;
          const relatedModelLower = relatedModel.toLowerCase();
          
          if (field.isList) {
            fileContent += `  ${relatedModelLower}: (${model.name.toLowerCase()}Table: typeof ${model.name.toLowerCase()}) => {\n`;
            fileContent += `    return {\n`;
            fileContent += `      one: ${model.name.toLowerCase()},\n`;
            fileContent += `      many: ${relatedModelLower},\n`;
            fileContent += `      relation: (m, n) => eq(m.id, n.${model.name.toLowerCase()}Id),\n`;
            fileContent += `    };\n`;
            fileContent += `  },\n`;
          } else {
            fileContent += `  ${field.name}: (${model.name.toLowerCase()}Table: typeof ${model.name.toLowerCase()}) => {\n`;
            fileContent += `    return {\n`;
            fileContent += `      one: ${relatedModelLower},\n`;
            fileContent += `      many: ${model.name.toLowerCase()},\n`;
            fileContent += `      relation: (m, n) => eq(n.${field.name}Id, m.id),\n`;
            fileContent += `    };\n`;
            fileContent += `  },\n`;
          }
        }
      });
      
      fileContent += `};\n`;
      
      // 写入文件
      const filePath = path.resolve(outputDir, `${model.name.toLowerCase()}.ts`);
      fs.writeFileSync(filePath, fileContent);
      
      // 更新索引文件
      indexContent += `import { ${model.name.toLowerCase()}, ${model.name.toLowerCase()}Relations } from './${model.name.toLowerCase()}';\n`;
    });
    
    // 完成索引文件
    indexContent += `\n// 导出关系\nexport const relations = {\n`;
    dmmf.modelMap.forEach((model: any) => {
      indexContent += `  ${model.name.toLowerCase()}: ${model.name.toLowerCase()}Relations,\n`;
    });
    indexContent += `};\n\n`;
    
    // 添加数据库连接
    indexContent += `// 导出模型\nexport const models = {\n`;
    dmmf.modelMap.forEach((model: any) => {
      indexContent += `  ${model.name.toLowerCase()},\n`;
    });
    indexContent += `};\n\n`;
    
    indexContent += `// 连接数据库\nconst connection = await mysql.createConnection(config.database.url);\n\n`;
    indexContent += `// 创建Drizzle ORM实例\nexport const db = drizzle(connection, { schema: models, relations });\n`;
    
    // 写入索引文件
    const indexPath = path.resolve(outputDir, 'index.ts');
    fs.writeFileSync(indexPath, indexContent);
    
    console.log('Drizzle模型生成成功！');
    console.log(`输出目录: ${outputDir}`);
  } catch (error) {
    console.error('生成Drizzle模型失败:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// 运行生成器
generateDrizzleSchema(); 