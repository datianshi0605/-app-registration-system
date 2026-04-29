#!/bin/bash
# 图表数据标签修复脚本
# 使用方法：scp 到服务器后执行

cd /home/-app-registration-system/public || exit 1

# 备份
cp index.html index.html.bak.$(date +%Y%m%d%H%M)

# 检查是否已经有 datalabels
if grep -q "datalabels:" index.html; then
    echo "✅ 图表数据标签已存在，无需修复"
    exit 0
fi

# 添加 datalabels 插件引用
sed -i 's|<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>|<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>\n    <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-datalabels@2"></script>|' index.html

echo "✅ 已添加 datalabels 插件引用"

# 重启服务
kill $(lsof -ti :9999) 2>/dev/null
echo "🔄 服务已停止，请手动执行 npm start"
echo ""
echo "现在刷新页面，图表上就会显示数字了！"
