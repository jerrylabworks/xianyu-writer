// ========================
// 闲鱼文案生成器核心引擎
// ========================

let uploadedImages = [];

const PHOTO_TIPS = {
  digital: ['正面整体', '背面/接口', '细节特写', '配件合照', '开机/功能演示'],
  book: ['封面', '版权页', '内页', '书脊/边角', '笔记页（如有）'],
  clothing: ['正面平铺', '背面', '细节/标签', '吊牌', '上身效果（可选）'],
  beauty: ['正面瓶身', '瓶底/保质期', '质地/色号', '包装盒', '使用前后（可选）'],
  home: ['整体外观', '细节/功能', '尺寸参照', '使用场景', '瑕疵特写（如有）'],
  other: ['正面', '侧面', '细节', '配件', '瑕疵/磨损（如实拍）']
};

const TITLE_TEMPLATES = {
  digital: [
    "【{condition}】{name} {highlight}",
    "{name} {condition} 正品保证 个人闲置",
    "【低价出】{name} {condition} 比全新省{save}元",
    "{name} {condition} 功能完好 搬家清出",
    "【个人闲置】{name} {condition} 实拍图"
  ],
  book: [
    "【{condition}】{name} 正版保证",
    "{name} {condition} 笔记少/无笔记",
    "【低价转让】{name} {condition} 学生党",
    "{name} {condition} 考完试出 教材教辅"
  ],
  clothing: [
    "【{condition}】{name} 上身好看",
    "{name} {condition} 买大了/买小了 转出",
    "【断舍离】{name} {condition} 衣柜清理",
    "{name} {condition} 仅试穿 吊牌在"
  ],
  beauty: [
    "【{condition}】{name} 正品可查",
    "{name} {condition} 保质期新鲜",
    "【买多了】{name} {condition} 出一瓶",
    "{name} {condition} 专柜/旗舰店购入"
  ],
  home: [
    "【{condition}】{name} 实用好物",
    "{name} {condition} 搬家清理",
    "【家居好物】{name} {condition} 空间神器",
    "{name} {condition} 买重复了 低价出"
  ],
  other: [
    "【{condition}】{name} 个人闲置",
    "{name} {condition} 低价转让",
    "【清理闲置】{name} {condition}"
  ]
};

const CONDITION_MAP = {
  new: { text: "全新未拆封", emoji: "✅", desc: "全新未拆封，包装完好" },
  like_new: { text: "几乎全新", emoji: "🌟", desc: "几乎全新，无使用痕迹" },
  good: { text: "轻微使用", emoji: "👌", desc: "轻微使用痕迹，不影响使用" },
  fair: { text: "明显使用", emoji: "🔧", desc: "有明显使用痕迹，功能完好" }
};

const BODY_TEMPLATES = {
  digital: `📦 商品状态：{conditionDesc}，如图所示
{photoDesc}
✅ 功能测试：全部功能正常，无暗病
📎 配件清单：{details}
💡 适合人群：{targetUser}

🔥 为什么值得买：
{reasons}

📮 发货说明：
24小时内发货，气泡袋+纸箱包装，确保到手完好。
二手物品售出不退不换，发货前可视频确认状态。

💰 价格说明：
{priceText}
爽快买家可小刀，屠龙刀勿扰。`,

  book: `📚 书籍状态：{conditionDesc}
{photoDesc}
✅ 版本信息：正版图书
📝 笔记情况：{details}

📖 内容简介：
{reasons}

📮 发货说明：
书本较厚会用硬纸板加固发货，确保不折角。
二手图书售出不退不换。

💰 价格说明：
{priceText}
学生党可小刀，欢迎私信。`,

  clothing: `👕 衣物状态：{conditionDesc}
{photoDesc}
📏 尺码信息：{details}
🎨 颜色/面料：以实拍图为准

✨ 转让原因：
{reasons}

📮 发货说明：
洗净消毒后发货，独立包装袋封装。
二手衣物售出不退不换，发货前可拍细节图确认。

💰 价格说明：
{priceText}
诚心要可小刀，包邮出。`,

  beauty: `💄 商品状态：{conditionDesc}
{photoDesc}
✅ 正品保证：{details}
📅 保质期：新鲜

🌟 使用感受：
{reasons}

📮 发货说明：
气泡膜包装，避免运输磕碰。
护肤品化妆品售出不退不换。

💰 价格说明：
{priceText}
买多了出一瓶，爽快包邮。`,

  home: `🏠 商品状态：{conditionDesc}
{photoDesc}
✅ 功能完好：无损坏
📐 尺寸/参数：{details}

💡 实用场景：
{reasons}

📮 发货说明：
24小时内发货，易碎品会加固包装。
二手物品售出不退不换。

💰 价格说明：
{priceText}
搬家清理，低价出，可小刀。`,

  other: `📦 商品状态：{conditionDesc}
{photoDesc}
✅ 来源说明：个人闲置，正品保证
📎 补充信息：{details}

🔥 转让说明：
{reasons}

📮 发货说明：
24小时内发货，安全包装。
售出不退不换，发货前可确认状态。

💰 价格说明：
{priceText}
诚心出，欢迎私信。`
};

const TAGS = {
  digital: ["数码", "电子", "开发板", "编程", "创客", "学生", "闲置", "低价", "个人转让"],
  book: ["图书", "教材", "教辅", "考试", "学生", "正版", "二手书", "学习", "闲置"],
  clothing: ["穿搭", "断舍离", "闲置", "几乎全新", "清衣柜", "低价", "转让", "正品"],
  beauty: ["美妆", "护肤", "正品", "闲置", "全新", "保质期", "低价出", "买多了"],
  home: ["家居", "日用", "实用", "搬家清理", "低价", "闲置转让", "好物", "空间"],
  other: ["闲置", "转让", "低价", "个人", "正品", "清出", "搬家", "二手"]
};

const REASONS = {
  digital: [
    "功能完全够用，入门学习首选，性价比极高",
    "比买全新省不少钱，省下的钱可以买点别的配件",
    "个人保护得很好，出手是因为升级换代",
    "适合预算有限但又想体验的朋友"
  ],
  book: [
    "内容完整，看完考完试转出，给需要的人",
    "书中知识点清晰，适合自学/备考",
    "正版印刷清晰，阅读体验好",
    "笔记少/无笔记，不影响阅读"
  ],
  clothing: [
    "款式好看，买大了/小了，不适合自己身材",
    "面料舒服，只试穿过一次，几乎全新",
    "衣柜塞不下了，断舍离清理",
    "专柜购入，品质有保障"
  ],
  beauty: [
    "买多了用不完，出一瓶给需要的姐妹",
    "肤质不合适，低价转让，不想浪费",
    "保质期还很长，正品可查",
    "口碑好物，小红书爆款"
  ],
  home: [
    "实用性强，家里没地方放了",
    "功能完好，搬家带不走",
    "性价比极高，比买新的划算",
    "生活好物，提升幸福感"
  ],
  other: [
    "个人闲置，用不上了，低价转让给需要的人",
    "保存完好，买回来后很少使用",
    "清理家里空间，诚心出",
    "正品保证，支持任何形式的验证"
  ]
};

function renderImagePreview() {
  const grid = document.getElementById('imagePreviewGrid');
  const placeholder = document.getElementById('uploadPlaceholder');
  const uploadArea = document.getElementById('uploadArea');
  const countEl = document.getElementById('imageCount');

  grid.innerHTML = '';

  if (uploadedImages.length === 0) {
    placeholder.style.display = 'flex';
    uploadArea.classList.remove('has-images');
    countEl.style.display = 'none';
    return;
  }

  placeholder.style.display = 'none';
  uploadArea.classList.add('has-images');
  countEl.style.display = 'block';
  countEl.textContent = `已选 ${uploadedImages.length} 张`;

  uploadedImages.forEach((img, idx) => {
    const div = document.createElement('div');
    div.className = 'preview-item';
    div.innerHTML = `<img src="${img.dataUrl}" alt="预览"><button class="remove-btn" data-idx="${idx}">×</button>`;
    grid.appendChild(div);
  });

  grid.querySelectorAll('.remove-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      removeImage(parseInt(btn.dataset.idx));
    });
  });
}

function removeImage(idx) {
  uploadedImages.splice(idx, 1);
  renderImagePreview();
}

// ========================
// 预览功能 - 读取已生成的文案
// ========================

function showPreview() {
  const sellPrice = parseFloat(document.getElementById('sellPrice').value) || 0;
  const originalPrice = parseFloat(document.getElementById('originalPrice').value) || 0;

  // 价格
  document.getElementById('previewPrice').textContent = sellPrice > 0 ? `¥${sellPrice}` : '价格面议';
  if (originalPrice > 0 && sellPrice > 0 && originalPrice > sellPrice) {
    document.getElementById('previewOriginal').textContent = `¥${originalPrice}`;
  } else {
    document.getElementById('previewOriginal').textContent = '';
  }

  // 标题 - 直接用已生成的
  const title = document.getElementById('resultTitle').value || '商品标题';
  document.getElementById('previewTitle').textContent = title;

  // 图片预览
  const imgContainer = document.getElementById('previewImages');
  imgContainer.innerHTML = '';
  if (uploadedImages.length > 0) {
    uploadedImages.forEach(img => {
      const div = document.createElement('div');
      div.className = 'preview-img-item';
      div.innerHTML = `<img src="${img.dataUrl}" alt="">`;
      imgContainer.appendChild(div);
    });
  } else {
    // 显示5个灰色占位图
    for (let i = 0; i < 5; i++) {
      const div = document.createElement('div');
      div.className = 'preview-img-placeholder';
      div.textContent = '📷';
      imgContainer.appendChild(div);
    }
  }

  // 标签 - 直接用已生成的
  const tagsHtml = document.getElementById('resultTags').innerHTML || '';
  document.getElementById('previewTags').innerHTML = tagsHtml;

  // 描述 - 直接用已生成的正文
  const body = document.getElementById('resultBody').value || '暂无描述';
  document.getElementById('previewDesc').textContent = body;

  document.getElementById('previewModal').style.display = 'flex';
}

function closePreview() {
  document.getElementById('previewModal').style.display = 'none';
}

function generateCopy() {
  const name = document.getElementById('productName').value.trim();
  const category = document.getElementById('category').value;
  const condition = document.getElementById('condition').value;
  const originalPrice = parseFloat(document.getElementById('originalPrice').value) || 0;
  const sellPrice = parseFloat(document.getElementById('sellPrice').value) || 0;
  const details = document.getElementById('details').value.trim();

  if (!name) {
    alert('请填写商品名称！');
    return;
  }

  const cond = CONDITION_MAP[condition];
  const saveAmount = originalPrice > sellPrice ? Math.round(originalPrice - sellPrice) : 0;
  const discount = (originalPrice > 0 && sellPrice > 0) ? Math.round((sellPrice / originalPrice) * 10) : 0;

  // 生成标题
  const titles = TITLE_TEMPLATES[category] || TITLE_TEMPLATES.other;
  const titleTemplate = titles[Math.floor(Math.random() * titles.length)];
  const highlight = details ? details.split(/[，。；]/)[0].substring(0, 15) : '个人闲置';
  const title = titleTemplate
    .replace('{name}', name)
    .replace('{condition}', cond.text)
    .replace('{highlight}', highlight)
    .replace('{save}', saveAmount > 0 ? saveAmount : '不少');

  // 生成价格文案
  let priceText = '';
  if (originalPrice > 0 && sellPrice > 0) {
    if (saveAmount > 0) {
      priceText = `原价¥${originalPrice}，现仅售¥${sellPrice}，立省¥${saveAmount}（相当于${discount}折）。`;
    } else {
      priceText = `售价¥${sellPrice}，诚心价不议价。`;
    }
  } else if (sellPrice > 0) {
    priceText = `售价¥${sellPrice}，爽快可小刀。`;
  } else {
    priceText = '价格可议，欢迎带价私聊。';
  }

  // 生成卖点
  const reasonsList = REASONS[category] || REASONS.other;
  const selectedReasons = reasonsList.sort(() => 0.5 - Math.random()).slice(0, 2);
  const reasonsText = selectedReasons.map(r => `· ${r}`).join('\n');

  // 生成图片说明
  const photoTips = PHOTO_TIPS[category] || PHOTO_TIPS.other;
  let photoDesc = '';
  if (uploadedImages.length > 0) {
    photoDesc = `📸 实拍图：已上传 ${uploadedImages.length} 张实拍图，多角度展示商品真实状态。所见即所得，放心购买。`;
  } else {
    const tipsText = photoTips.slice(0, 3).join('、');
    photoDesc = `📸 实拍图：建议上传以下角度的照片 — ${tipsText}，让买家更信任。`;
  }

  // 生成正文
  const targetUser = category === 'digital' ? '学生、创客、编程爱好者' :
                     category === 'book' ? '备考学生、自学者' :
                     category === 'clothing' ? '身材合适的姐妹' :
                     category === 'beauty' ? '需要护肤的姐妹' :
                     category === 'home' ? '注重生活品质的人' : '需要的人';

  const bodyTemplate = BODY_TEMPLATES[category] || BODY_TEMPLATES.other;
  const body = bodyTemplate
    .replace('{conditionDesc}', cond.desc)
    .replace('{photoDesc}', photoDesc)
    .replace('{details}', details || '详见描述')
    .replace('{targetUser}', targetUser)
    .replace('{reasons}', reasonsText)
    .replace('{priceText}', priceText);

  // 生成标签
  const baseTags = TAGS[category] || TAGS.other;
  const customTags = name.split(/[\s\-，。；]/).filter(w => w.length >= 2 && w.length <= 6).slice(0, 3);
  const allTags = [...new Set([...baseTags, ...customTags, cond.text])];
  const tagsHtml = allTags.slice(0, 10).map(t => `<span class="tag">#${t}</span>`).join('');
  const tagsText = allTags.slice(0, 10).map(t => `#${t}`).join(' ');

  // 显示结果
  document.getElementById('resultTitle').value = title;
  document.getElementById('resultBody').value = body;
  document.getElementById('resultTags').innerHTML = tagsHtml;
  document.getElementById('resultTags').dataset.text = tagsText;

  document.getElementById('resultSection').style.display = 'block';
  document.getElementById('tipsSection').style.display = 'block';
  document.getElementById('donateSection').style.display = 'block';
}

// 预览按钮事件
document.getElementById('previewBtn').addEventListener('click', showPreview);
document.getElementById('previewClose').addEventListener('click', closePreview);
document.getElementById('previewOverlay').addEventListener('click', closePreview);
document.getElementById('btnBackToEdit').addEventListener('click', closePreview);

// 图片上传
document.getElementById('uploadArea').addEventListener('click', (e) => {
  if (e.target.closest('.remove-btn')) return;
  document.getElementById('productImages').click();
});

document.getElementById('productImages').addEventListener('change', (e) => {
  const files = Array.from(e.target.files);
  files.forEach(file => {
    if (!file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      uploadedImages.push({ name: file.name, dataUrl: ev.target.result });
      renderImagePreview();
    };
    reader.readAsDataURL(file);
  });
  e.target.value = '';
});

// Tab切换
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    btn.classList.add('active');
    document.getElementById('tab-' + btn.dataset.tab).classList.add('active');
  });
});

// 生成按钮
document.getElementById('generateBtn').addEventListener('click', generateCopy);

// 复制功能
document.querySelectorAll('.btn-copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const targetId = btn.dataset.target;
    let text = '';
    if (targetId === 'resultTags') {
      text = document.getElementById('resultTags').dataset.text || '';
    } else {
      text = document.getElementById(targetId)?.value || '';
    }
    if (text) {
      navigator.clipboard.writeText(text).then(() => {
        const original = btn.textContent;
        btn.textContent = '✅ 已复制！';
        btn.style.background = '#4CAF50';
        setTimeout(() => {
          btn.textContent = original;
          btn.style.background = '';
        }, 1500);
      });
    }
  });
});
