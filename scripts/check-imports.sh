#!/bin/bash

# 输出颜色配置
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}正在检查相对父路径导入...${NC}"

# 检查是否存在相对父路径导入
FOUND=$(grep -r --include="*.ts" --include="*.tsx" "from '\.\.\/" packages/)

if [ -n "$FOUND" ]; then
  echo -e "${RED}发现相对父路径导入，请改用路径别名:${NC}"
  echo "$FOUND"
  
  # 统计发现的问题数量
  LINE_COUNT=$(echo "$FOUND" | wc -l)
  echo -e "${RED}共发现 $LINE_COUNT 处相对父路径导入问题${NC}"
  
  # 提供修复建议
  echo -e "${YELLOW}修复建议:${NC}"
  echo "1. 使用 @/ 路径别名替换相对路径"
  echo "2. 运行 'pnpm run lint:fix' 尝试自动修复"
  echo "3. 查阅 docs/detailed/setup/paths.md 获取详细指导"
  
  exit 1
else
  echo -e "${GREEN}很好！未发现相对父路径导入问题.${NC}"
  exit 0
fi 