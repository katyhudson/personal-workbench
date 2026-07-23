(function(global){
  function esc(s){
    return String(s == null ? '' : s)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }
  function uid(){ return (global.uid ? global.uid() : ('l'+Date.now().toString(36)+Math.random().toString(36).slice(2,8))); }
  function getData(){
    if(global.WorkbenchData && global.WorkbenchData.ensureCollections) return global.WorkbenchData.ensureCollections();
    if(!global.data) global.data = {};
    if(!Array.isArray(global.data.learnPaths)) global.data.learnPaths = [];
    return global.data;
  }
  function paths(){ return getData().learnPaths || []; }
  function persist(){ if(typeof global.save === 'function') global.save(); if(typeof global.render === 'function') global.render(); }
  function toast(msg){ if(typeof global.toast === 'function') global.toast(msg); }
  function findPath(id){ return paths().find(function(p){ return p && p.id === id; }); }
  function activePathId(){
    var d = getData();
    if(!d.prefs) d.prefs = {};
    return d.prefs.learnActivePathId || null;
  }
  function setActivePathId(id){
    var d = getData();
    if(!d.prefs) d.prefs = {};
    d.prefs.learnActivePathId = id || null;
  }
  function parseLinks(text){
    return String(text || '').split(/\n+/).map(function(line){
      line = line.trim();
      if(!line) return null;
      var parts = line.split('|');
      var label = (parts[0] || '').trim();
      var url = (parts.slice(1).join('|') || '').trim();
      if(!label || !url) return null;
      var style = 'outline';
      if(/^看|观看|播放|视频|主/.test(label) || parts[2] && /primary/i.test(parts[2])) style = 'primary';
      return { label: label, url: url, style: style };
    }).filter(Boolean);
  }
  function linksToText(links){
    return (links || []).map(function(l){
      return (l.label || '') + ' | ' + (l.url || '') + (l.style === 'primary' ? ' | primary' : '');
    }).join('\n');
  }
  function openUrl(url){
    if(!url) return;
    try{ global.open(url, '_blank', 'noopener,noreferrer'); }catch(e){ location.href = url; }
  }
  global.openLearnExternalUrl = function(el){
    var url = el && el.getAttribute ? el.getAttribute('data-url') : el;
    if(!url){ toast('未设置链接'); return; }
    openUrl(url);
  };
  function renderLinkButtons(links){
    return (links || []).map(function(lk){
      if(!lk || !lk.url) return '';
      var cls = lk.style === 'primary' ? 'learn-link primary' : 'learn-link';
      var icon = lk.style === 'primary' ? '▶ ' : '';
      return '<button type="button" class="'+cls+'" data-url="'+esc(lk.url)+'" onclick="event.stopPropagation();openLearnExternalUrl(this)">'
        + icon + esc(lk.label || '打开') + '</button>';
    }).join('');
  }
  function ensureLearnEnabled(){
    if(global.WorkbenchModules && typeof global.WorkbenchModules.setEnabled === 'function'){
      if(!global.WorkbenchModules.isEnabled('learn')) global.WorkbenchModules.setEnabled('learn', true);
    }
  }
  global.ensureLearnAndOpen = function(){
    ensureLearnEnabled();
    setActivePathId(null);
    if(typeof global.setView === 'function') global.setView('learn');
  };
  global.ensureLearnAndNew = function(){
    ensureLearnEnabled();
    if(typeof global.openLearnPathForm === 'function') global.openLearnPathForm();
  };

  var editing = { pathId:null, stageId:null, moduleId:null, itemId:null };

  function ensurePathShape(p){
    if(!p.stages) p.stages = [];
    if(!p.items) p.items = [];
    if(!p.kind) p.kind = 'stages';
    if(!p.subtitle) p.subtitle = '';
    if(!p.note) p.note = '';
    return p;
  }

  function statusLabel(st){
    if(st === 'done') return '已掌握';
    if(st === 'active') return '进行中';
    return '未解锁';
  }
  function statusClass(st){
    if(st === 'done') return 'learn-st-done';
    if(st === 'active') return 'learn-st-active';
    return 'learn-st-locked';
  }

  function looksLikeUrl(s){
    s = String(s == null ? '' : s).trim();
    return /^https?:\/\//i.test(s) || /^www\./i.test(s);
  }
  function normalizeUrl(s){
    s = String(s == null ? '' : s).trim();
    if(!s) return '';
    if(!/^https?:\/\//i.test(s)) s = 'https://' + s.replace(/^\/\//, '');
    return s;
  }
  function pathQuickUrl(p){
    if(!p) return '';
    if(p.quickUrl) return normalizeUrl(p.quickUrl);
    if(looksLikeUrl(p.subtitle)) return normalizeUrl(p.subtitle);
    if(looksLikeUrl(p.note)) return normalizeUrl(p.note);
    return '';
  }
  function pathSubtitleText(p){
    if(!p) return '';
    if(looksLikeUrl(p.subtitle)) return '';
    return p.subtitle || '';
  }
  function jumpBtn(url, label, primary){
    url = normalizeUrl(url);
    if(!url) return '';
    var cls = primary ? 'learn-link primary' : 'learn-link';
    return '<button type="button" class="'+cls+'" data-url="'+esc(url)+'" onclick="event.stopPropagation();openLearnExternalUrl(this)">'
      + (primary ? '▶ ' : '') + esc(label || '打开链接') + '</button>';
  }

  function renderHome(){
    var list = paths();
    var html = '<div class="panel learn-panel"><div class="sec-head"><h2>📚 学习路线</h2>'
      + '<button class="btn primary" type="button" onclick="openLearnPathForm()">＋ 新建路线</button></div>';
    if(!list.length){
      html += '<div class="empty">还没有学习路线。可新建「阶段练习」（如小提琴）或「课程列表」（如英语文章）。</div></div>';
      return html;
    }
    html += '<div class="learn-path-list">';
    list.forEach(function(p){
      ensurePathShape(p);
      var meta = p.kind === 'list'
        ? ((p.items || []).length + ' 篇文章')
        : ((p.stages || []).length + ' 个阶段');
      var sub = pathSubtitleText(p);
      var qurl = pathQuickUrl(p);
      html += '<div class="learn-path-card" onclick="openLearnPath(\''+esc(p.id)+'\')">'
        + '<div class="learn-path-title">'+(p.kind==='list'?'🌐 ':'🎻 ')+esc(p.title||'未命名')+'</div>'
        + '<div class="learn-path-meta">'+esc(meta)+(sub ? ' · '+esc(sub) : '')+'</div>'
        + (qurl ? '<div class="learn-links" style="margin-top:10px" onclick="event.stopPropagation()">'+jumpBtn(qurl, '打开链接', true)+'</div>' : '')
        + '<div class="learn-path-acts" onclick="event.stopPropagation()">'
        + '<button class="icon-btn" type="button" title="编辑" onclick="openLearnPathForm(\''+esc(p.id)+'\')">✎</button>'
        + '<button class="icon-btn" type="button" title="删除" onclick="delLearnPath(\''+esc(p.id)+'\')">🗑</button>'
        + '</div></div>';
    });
    html += '</div></div>';
    return html;
  }

  function renderStagesBody(p, opts){
    opts = opts || {};
    var compact = !!opts.compact;
    var stages = p.stages || [];
    if(!stages.length) return '<div class="empty">还没有阶段，点「＋ 阶段」开始。</div>';
    var html = '';
    stages.forEach(function(st, idx){
      var locked = st.status === 'locked';
      if(compact && locked){
        html += '<div class="learn-stage is-locked '+statusClass(st.status)+'">'
          + '<div class="learn-stage-head"><div class="learn-stage-title">'+esc(st.title||('第'+(idx+1)+'阶段'))+'</div>'
          + '<span class="learn-badge '+statusClass(st.status)+'">'+statusLabel(st.status)+'</span></div></div>';
        return;
      }
      html += '<div class="learn-stage '+(locked?'is-locked':'')+' '+statusClass(st.status)+'">'
        + '<div class="learn-stage-head"><div class="learn-stage-title">'+esc(st.title||('第'+(idx+1)+'阶段'))+'</div>'
        + '<span class="learn-badge '+statusClass(st.status)+'">'+statusLabel(st.status)+'</span></div>';
      if(st.goal) html += '<div class="learn-kv"><b>目标</b><span>'+esc(st.goal)+'</span></div>';
      if(st.criteria) html += '<div class="learn-kv"><b>过关标准</b><span>'+esc(st.criteria)+'</span></div>';
      html += '<div class="learn-mods">';
      (st.modules || []).forEach(function(m){
        html += '<div class="learn-mod">'
          + '<div class="learn-mod-title">'+esc(m.title||'')+'</div>'
          + (m.desc ? '<div class="learn-mod-desc">'+esc(m.desc)+'</div>' : '')
          + '<div class="learn-links">'+renderLinkButtons(m.links)+'</div>';
        if(!locked && !compact){
          html += '<div class="learn-mod-acts">'
            + '<button class="btn" type="button" onclick="openLearnModuleForm(\''+esc(p.id)+'\',\''+esc(st.id)+'\',\''+esc(m.id)+'\')">编辑</button>'
            + '<button class="btn" type="button" onclick="delLearnModule(\''+esc(p.id)+'\',\''+esc(st.id)+'\',\''+esc(m.id)+'\')">删除</button>'
            + '</div>';
        }
        html += '</div>';
      });
      html += '</div>';
      if(!locked){
        html += '<div class="learn-stage-acts">';
        if(!compact){
          html += '<button class="btn" type="button" onclick="openLearnModuleForm(\''+esc(p.id)+'\',\''+esc(st.id)+'\')">＋ 子模块</button>'
            + '<button class="btn" type="button" onclick="openLearnStageForm(\''+esc(p.id)+'\',\''+esc(st.id)+'\')">编辑阶段</button>'
            + '<button class="btn" type="button" onclick="delLearnStage(\''+esc(p.id)+'\',\''+esc(st.id)+'\')">删除阶段</button>';
        }
        if(st.status === 'active'){
          html += '<button class="btn learn-master" type="button" onclick="masterLearnStage(\''+esc(p.id)+'\',\''+esc(st.id)+'\')">✓ 标记掌握（已达过关标准）</button>';
        }
        html += '</div>';
      }
      html += '</div>';
    });
    return html;
  }

  function renderStagesPath(p){
    var html = '<div class="learn-topbar"><button class="btn" type="button" onclick="closeLearnPath()">← 返回</button>'
      + '<h2 class="learn-h2">'+esc(p.title)+'</h2>'
      + '<button class="btn" type="button" onclick="openLearnPathForm(\''+esc(p.id)+'\')">编辑路线</button>'
      + '<button class="btn primary" type="button" onclick="openLearnStageForm(\''+esc(p.id)+'\')">＋ 阶段</button></div>';
    if(p.note) html += '<div class="hint" style="margin-bottom:12px">'+esc(p.note)+'</div>';
    html += renderStagesBody(p, { compact: false });
    return html;
  }

  function renderLearnOverviewSection(){
    var list = paths();
    var html = '<div class="panel learn-home" style="margin-bottom:14px"><div class="sec-head"><h2>📚 学习</h2>'
      + '<button class="btn" type="button" onclick="ensureLearnAndOpen()">管理路线</button>'
      + '<button class="btn primary" type="button" onclick="ensureLearnAndNew()">＋ 新建</button></div>';
    if(!list.length){
      html += '<div class="empty">学习卡片固定在首页。点「＋ 新建」创建阶段练习或课程列表；外链按钮只显示文案，点击即跳转。</div></div>';
      return html;
    }
    list.forEach(function(p){
      ensurePathShape(p);
      var sub = pathSubtitleText(p);
      var qurl = pathQuickUrl(p);
      html += '<div class="learn-home-path">';
      html += '<div class="learn-home-path-title" onclick="ensureLearnEnabled();openLearnPath(\''+esc(p.id)+'\');setView(\'learn\')">'
        + (p.kind==='list'?'🌐 ':'🎻 ')+esc(p.title||'未命名')
        + (sub ? '<span class="learn-home-sub"> · '+esc(sub)+'</span>' : '')
        + '</div>';
      if(qurl){
        html += '<div class="learn-links" style="margin:0 0 10px">'+jumpBtn(qurl, '打开链接', true)+'</div>';
      }
      if(p.kind === 'list'){
        var items = (p.items || []).slice(0, 8);
        if(!items.length) html += '<div class="empty">暂无文章</div>';
        items.forEach(function(it){
          html += '<div class="learn-article learn-home-article">'
            + '<div class="learn-article-title">'+esc(it.title||'')
            + (it.tag ? ' <span class="learn-tag">'+esc(it.tag)+'</span>' : '') + '</div>'
            + (it.subtitle ? '<div class="learn-article-sub">'+esc(it.subtitle)+'</div>' : '')
            + '<div class="learn-links">'
            + jumpBtn(it.url, '打开学习', true)
            + '<button type="button" class="btn" onclick="event.stopPropagation();bumpLearnListen(\''+esc(p.id)+'\',\''+esc(it.id)+'\')">已听 +1</button>'
            + '</div></div>';
        });
      } else {
        if(p.note && !looksLikeUrl(p.note)) html += '<div class="learn-list-note">'+esc(p.note)+'</div>';
        html += renderStagesBody(p, { compact: true });
      }
      html += '</div>';
    });
    html += '</div>';
    return html;
  }
  global.renderLearnOverviewSection = renderLearnOverviewSection;
  global.ensureLearnEnabled = ensureLearnEnabled;

  function renderListPath(p){
    var items = p.items || [];
    var html = '<div class="learn-topbar"><button class="btn" type="button" onclick="closeLearnPath()">← 返回</button>'
      + '<h2 class="learn-h2">🌐 '+esc(p.title)+'</h2>'
      + '<button class="btn" type="button" onclick="openLearnPathForm(\''+esc(p.id)+'\')">编辑路线</button>'
      + '<button class="btn primary" type="button" onclick="openLearnItemForm(\''+esc(p.id)+'\')">＋ 文章</button></div>';
    html += '<div class="learn-list-wrap">';
    if(p.subtitle) html += '<div class="learn-list-head">'+esc(p.subtitle)+'</div>';
    if(p.note) html += '<div class="learn-list-note">'+esc(p.note)+'</div>';
    html += '<div class="learn-list-sub">共 '+items.length+' 篇文章'+(items.length?'，点选一篇打开链接':'')+'</div>';
    if(!items.length){
      html += '<div class="empty">还没有文章，点「＋ 文章」添加。</div></div>';
      return html;
    }
    items.forEach(function(it){
      html += '<div class="learn-article" onclick="openLearnItem(\''+esc(p.id)+'\',\''+esc(it.id)+'\')">'
        + '<div class="learn-article-title">'+esc(it.title||'')
        + (it.tag ? ' <span class="learn-tag">'+esc(it.tag)+'</span>' : '')
        + '</div>'
        + (it.subtitle ? '<div class="learn-article-sub">'+esc(it.subtitle)+'</div>' : '')
        + '<div class="learn-article-meta">'
        + (it.words ? '<span>📝 '+esc(it.words)+(typeof it.words==='number'||/^\d+$/.test(String(it.words))?' 词':'')+'</span>' : '')
        + (it.duration ? '<span>⏱ '+esc(it.duration)+'</span>' : '')
        + (it.vocab ? '<span>🎯 词汇量 '+esc(it.vocab)+'</span>' : '')
        + '<span>👂 已听 '+(it.listenCount||0)+' 次</span>'
        + '</div>'
        + '<div class="learn-article-acts" onclick="event.stopPropagation()">'
        + '<button class="btn" type="button" onclick="bumpLearnListen(\''+esc(p.id)+'\',\''+esc(it.id)+'\')">已听 +1</button>'
        + '<button class="btn" type="button" onclick="openLearnItemForm(\''+esc(p.id)+'\',\''+esc(it.id)+'\')">编辑</button>'
        + '<button class="btn" type="button" onclick="delLearnItem(\''+esc(p.id)+'\',\''+esc(it.id)+'\')">删除</button>'
        + '</div></div>';
    });
    html += '</div>';
    return html;
  }

  function renderLearn(){
    var id = activePathId();
    var p = id ? findPath(id) : null;
    if(p){
      ensurePathShape(p);
      return p.kind === 'list' ? renderListPath(p) : renderStagesPath(p);
    }
    return renderHome();
  }

  global.renderLearn = renderLearn;
  global.openLearnPath = function(id){ setActivePathId(id); persist(); };
  global.closeLearnPath = function(){ setActivePathId(null); persist(); };

  global.openLearnPathForm = function(id){
    editing.pathId = id || null;
    var p = id ? findPath(id) : null;
    document.getElementById('learnPathTitle').textContent = id ? '编辑学习路线' : '新建学习路线';
    document.getElementById('lp_title').value = p ? (p.title || '') : '';
    document.getElementById('lp_kind').value = p ? (p.kind || 'stages') : 'stages';
    document.getElementById('lp_subtitle').value = p ? pathSubtitleText(p) : '';
    document.getElementById('lp_url').value = p ? pathQuickUrl(p) : '';
    document.getElementById('lp_note').value = p && !looksLikeUrl(p.note) ? (p.note || '') : (p && looksLikeUrl(p.note) ? '' : '');
    document.getElementById('learnPathMask').classList.add('show');
    document.getElementById('lp_title').focus();
  };
  global.closeLearnPathForm = function(){ document.getElementById('learnPathMask').classList.remove('show'); editing.pathId = null; };
  global.submitLearnPath = function(){
    var title = document.getElementById('lp_title').value.trim();
    if(!title){ alert('请填写路线名称'); return; }
    var kind = document.getElementById('lp_kind').value || 'stages';
    var subtitle = document.getElementById('lp_subtitle').value.trim();
    var quickUrl = normalizeUrl(document.getElementById('lp_url').value.trim());
    var note = document.getElementById('lp_note').value.trim();
    if(looksLikeUrl(subtitle) && !quickUrl){ quickUrl = normalizeUrl(subtitle); subtitle = ''; }
    if(editing.pathId){
      var p = findPath(editing.pathId);
      if(!p) return;
      p.title = title; p.kind = kind; p.subtitle = subtitle; p.note = note; p.quickUrl = quickUrl;
      ensurePathShape(p);
    } else {
      var np = { id: uid(), title: title, kind: kind, subtitle: subtitle, note: note, quickUrl: quickUrl, stages: [], items: [] };
      if(kind === 'stages'){
        np.stages = [{ id: uid(), title: '第1阶段', goal: '', criteria: '', status: 'active', modules: [] }];
      }
      paths().push(np);
      setActivePathId(np.id);
    }
    closeLearnPathForm();
    persist();
    toast('已保存学习路线');
  };
  global.delLearnPath = function(id){
    if(!confirm('删除该学习路线及其中全部内容？')) return;
    getData().learnPaths = paths().filter(function(p){ return p.id !== id; });
    if(activePathId() === id) setActivePathId(null);
    persist();
  };

  global.openLearnStageForm = function(pathId, stageId){
    editing.pathId = pathId;
    editing.stageId = stageId || null;
    var p = findPath(pathId); if(!p) return;
    var st = stageId ? (p.stages || []).find(function(s){ return s.id === stageId; }) : null;
    document.getElementById('learnStageTitle').textContent = stageId ? '编辑阶段' : '新建阶段';
    document.getElementById('ls_title').value = st ? (st.title || '') : '';
    document.getElementById('ls_goal').value = st ? (st.goal || '') : '';
    document.getElementById('ls_criteria').value = st ? (st.criteria || '') : '';
    document.getElementById('learnStageMask').classList.add('show');
    document.getElementById('ls_title').focus();
  };
  global.closeLearnStageForm = function(){ document.getElementById('learnStageMask').classList.remove('show'); editing.stageId = null; };
  global.submitLearnStage = function(){
    var p = findPath(editing.pathId); if(!p) return;
    ensurePathShape(p);
    var title = document.getElementById('ls_title').value.trim();
    if(!title){ alert('请填写阶段标题'); return; }
    var goal = document.getElementById('ls_goal').value.trim();
    var criteria = document.getElementById('ls_criteria').value.trim();
    if(editing.stageId){
      var st = p.stages.find(function(s){ return s.id === editing.stageId; });
      if(st){ st.title = title; st.goal = goal; st.criteria = criteria; }
    } else {
      var hasActive = p.stages.some(function(s){ return s.status === 'active'; });
      p.stages.push({ id: uid(), title: title, goal: goal, criteria: criteria, status: hasActive ? 'locked' : 'active', modules: [] });
    }
    closeLearnStageForm();
    persist();
  };
  global.delLearnStage = function(pathId, stageId){
    if(!confirm('删除该阶段及其子模块？')) return;
    var p = findPath(pathId); if(!p) return;
    p.stages = (p.stages || []).filter(function(s){ return s.id !== stageId; });
    if(p.stages.length && !p.stages.some(function(s){ return s.status === 'active'; })){
      var firstLocked = p.stages.find(function(s){ return s.status === 'locked'; });
      if(firstLocked) firstLocked.status = 'active';
      else if(p.stages[0].status !== 'done') p.stages[0].status = 'active';
    }
    persist();
  };
  global.masterLearnStage = function(pathId, stageId){
    var p = findPath(pathId); if(!p) return;
    var stages = p.stages || [];
    var idx = stages.findIndex(function(s){ return s.id === stageId; });
    if(idx < 0) return;
    stages[idx].status = 'done';
    if(idx + 1 < stages.length && stages[idx + 1].status === 'locked'){
      stages[idx + 1].status = 'active';
    }
    persist();
    toast('已标记掌握'+(idx+1 < stages.length ? '，下一阶段已解锁' : ''));
  };

  global.openLearnModuleForm = function(pathId, stageId, moduleId){
    editing.pathId = pathId;
    editing.stageId = stageId;
    editing.moduleId = moduleId || null;
    var p = findPath(pathId); if(!p) return;
    var st = (p.stages || []).find(function(s){ return s.id === stageId; }); if(!st) return;
    var m = moduleId ? (st.modules || []).find(function(x){ return x.id === moduleId; }) : null;
    document.getElementById('learnModuleTitle').textContent = moduleId ? '编辑子模块' : '新建子模块';
    document.getElementById('lm_title').value = m ? (m.title || '') : '';
    document.getElementById('lm_desc').value = m ? (m.desc || '') : '';
    document.getElementById('lm_links').value = m ? linksToText(m.links) : '看教学视频 | https://\nB站搜更多 | https://\n抖音跟练 | https://';
    document.getElementById('learnModuleMask').classList.add('show');
    document.getElementById('lm_title').focus();
  };
  global.closeLearnModuleForm = function(){ document.getElementById('learnModuleMask').classList.remove('show'); editing.moduleId = null; };
  global.submitLearnModule = function(){
    var p = findPath(editing.pathId); if(!p) return;
    var st = (p.stages || []).find(function(s){ return s.id === editing.stageId; }); if(!st) return;
    if(!st.modules) st.modules = [];
    var title = document.getElementById('lm_title').value.trim();
    if(!title){ alert('请填写子模块标题'); return; }
    var desc = document.getElementById('lm_desc').value.trim();
    var links = parseLinks(document.getElementById('lm_links').value);
    if(editing.moduleId){
      var m = st.modules.find(function(x){ return x.id === editing.moduleId; });
      if(m){ m.title = title; m.desc = desc; m.links = links; }
    } else {
      st.modules.push({ id: uid(), title: title, desc: desc, links: links });
    }
    closeLearnModuleForm();
    persist();
  };
  global.delLearnModule = function(pathId, stageId, moduleId){
    if(!confirm('删除该子模块？')) return;
    var p = findPath(pathId); if(!p) return;
    var st = (p.stages || []).find(function(s){ return s.id === stageId; }); if(!st) return;
    st.modules = (st.modules || []).filter(function(m){ return m.id !== moduleId; });
    persist();
  };

  global.openLearnItemForm = function(pathId, itemId){
    editing.pathId = pathId;
    editing.itemId = itemId || null;
    var p = findPath(pathId); if(!p) return;
    var it = itemId ? (p.items || []).find(function(x){ return x.id === itemId; }) : null;
    document.getElementById('learnItemTitle').textContent = itemId ? '编辑文章' : '新建文章';
    document.getElementById('li_title').value = it ? (it.title || '') : '';
    document.getElementById('li_subtitle').value = it ? (it.subtitle || '') : '';
    document.getElementById('li_tag').value = it ? (it.tag || '') : 'BBC';
    document.getElementById('li_words').value = it ? (it.words || '') : '';
    document.getElementById('li_duration').value = it ? (it.duration || '') : '';
    document.getElementById('li_vocab').value = it ? (it.vocab || '') : '';
    document.getElementById('li_url').value = it ? (it.url || '') : '';
    document.getElementById('learnItemMask').classList.add('show');
    document.getElementById('li_title').focus();
  };
  global.closeLearnItemForm = function(){ document.getElementById('learnItemMask').classList.remove('show'); editing.itemId = null; };
  global.submitLearnItem = function(){
    var p = findPath(editing.pathId); if(!p) return;
    ensurePathShape(p);
    var title = document.getElementById('li_title').value.trim();
    if(!title){ alert('请填写标题'); return; }
    var url = document.getElementById('li_url').value.trim();
    if(!url){ alert('请填写跳转链接'); return; }
    var obj = {
      title: title,
      subtitle: document.getElementById('li_subtitle').value.trim(),
      tag: document.getElementById('li_tag').value.trim(),
      words: document.getElementById('li_words').value.trim(),
      duration: document.getElementById('li_duration').value.trim(),
      vocab: document.getElementById('li_vocab').value.trim(),
      url: url
    };
    if(editing.itemId){
      var it = p.items.find(function(x){ return x.id === editing.itemId; });
      if(it) Object.assign(it, obj);
    } else {
      obj.id = uid();
      obj.listenCount = 0;
      p.items.push(obj);
    }
    closeLearnItemForm();
    persist();
  };
  global.delLearnItem = function(pathId, itemId){
    if(!confirm('删除该文章？')) return;
    var p = findPath(pathId); if(!p) return;
    p.items = (p.items || []).filter(function(x){ return x.id !== itemId; });
    persist();
  };
  global.openLearnItem = function(pathId, itemId){
    var p = findPath(pathId); if(!p) return;
    var it = (p.items || []).find(function(x){ return x.id === itemId; });
    if(!it || !it.url){ toast('未设置链接'); return; }
    it.listenCount = (it.listenCount || 0) + 1;
    if(typeof global.save === 'function') global.save();
    openUrl(it.url);
    if(typeof global.render === 'function') global.render();
  };
  global.bumpLearnListen = function(pathId, itemId){
    var p = findPath(pathId); if(!p) return;
    var it = (p.items || []).find(function(x){ return x.id === itemId; });
    if(!it) return;
    it.listenCount = (it.listenCount || 0) + 1;
    persist();
  };

  if(global.WorkbenchModuleRegistry && typeof global.WorkbenchModuleRegistry.register === 'function'){
    global.WorkbenchModuleRegistry.register('learn', renderLearn);
  }
  if(global.WorkbenchPageRegistry && typeof global.WorkbenchPageRegistry.register === 'function'){
    global.WorkbenchPageRegistry.register('learn', renderLearn);
  }
})(window);
