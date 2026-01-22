// Suno 字幕下載 Bookmarklet
// 將此程式碼儲存為書籤，在 Suno 歌曲頁面點擊即可下載字幕

(function() {
    'use strict';
    
    // 取得 Cookie（改進版本，能處理多個同名 Cookie）
    const getCookie = (name) => {
        // 方法 1: 直接從 document.cookie 讀取
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length >= 2) {
            // 如果有多個同名 Cookie，取最後一個（通常是最新的）
            const cookieValue = parts[parts.length - 1].split(';').shift();
            if (cookieValue) {
                try {
                    return decodeURIComponent(cookieValue);
                } catch (e) {
                    return cookieValue; // 如果解碼失敗，返回原始值
                }
            }
        }
        return null;
    };
    
    // 取得所有同名 Cookie（處理多個同名 Cookie 的情況）
    const getAllCookies = (name) => {
        const allCookies = document.cookie.split(';').map(c => {
            const [n, ...valueParts] = c.trim().split('=');
            return {
                name: n.trim(),
                value: valueParts.join('=')
            };
        });
        return allCookies.filter(c => c.name === name).map(c => {
            try {
                return decodeURIComponent(c.value);
            } catch (e) {
                return c.value;
            }
        });
    };
    
    // 列出所有 Cookie（除錯用）
    const listAllCookies = () => {
        return document.cookie.split(';').map(c => {
            const [name, ...valueParts] = c.trim().split('=');
            return { name: name.trim(), value: valueParts.join('=') };
        });
    };
    
    // 取得安全的檔名（按照 PDF 說明的方式，命名為 getSafeTitle）
    const getSafeTitle = (id) => {
        let title = document.querySelector('meta[property="og:title"]')?.content?.trim()
            || document.querySelector('h1')?.innerText?.trim()
            || document.title?.trim()
            || id;
        
        title = title.replace(/\s+/g, ' ').replace(/[\\/:*?"<>|\[\]]+/g, '_');
        return title || id || 'suno_song';
    };
    
    // 移除標籤
    const stripMeta = (text) => String(text || '').replace(/\[[^\]]*?\]/g, '');
    
    // 檢查是否只有括號
    const isParenOnly = (text) => /^\([^)]*\)$/.test(text.trim());
    
    // 建立字幕段落（按照 PDF 說明的方式）
    const buildSegments = (w) => {
        w = [...w].sort((a, b) => a.start_s - b.start_s);
        let seg = [];
        let txt = '';
        let s = null;
        let e = null;
        
        const push = () => {
            const t = txt.trim();
            if (s !== null && t) {
                seg.push({ start: s, end: e, text: t });
            }
            txt = '';
            s = null;
            e = null;
        };
        
        for (const x of w) {
            if (!x?.word) continue;
            let raw = stripMeta(x.word);
            if (!raw.trim()) continue;
            
            const hard = /\n\n\s*$/.test(raw);
            const soft = !hard && /\n\s*$/.test(raw);
            const parts = raw.replace(/\s*$/, '').split(/\n+/);
            
            for (let i = 0; i < parts.length; i++) {
                const p = parts[i].trim();
                if (!p || isParenOnly(p)) continue;
                
                if (s === null) {
                    s = x.start_s;
                    e = x.end_s;
                    txt = p;
                } else {
                    e = Math.max(e, x.end_s);
                    txt += (txt ? ' ' : '') + p;
                }
                
                if (i < parts.length - 1) {
                    push();
                }
            }
            
            if (hard || soft) {
                push();
            }
        }
        
        push();
        return seg;
    };
    
    // SRT 時間格式
    const formatSrtTime = (seconds) => {
        const totalMs = Math.round(seconds * 1000);
        const hours = Math.floor(totalMs / 3600000);
        const minutes = Math.floor((totalMs % 3600000) / 60000);
        const secs = Math.floor((totalMs % 60000) / 1000);
        const ms = totalMs % 1000;
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
    };
    
    // LRC 時間格式
    const formatLrcTime = (seconds) => {
        const totalCs = Math.round(seconds * 100);
        const minutes = Math.floor(totalCs / 6000);
        const secs = Math.floor((totalCs % 6000) / 100);
        const cs = totalCs % 100;
        return `[${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}]`;
    };
    
    // 生成 SRT
    const generateSrt = (segments) => {
        const lines = [];
        segments.forEach((seg, i) => {
            lines.push(`${i + 1}`);
            lines.push(`${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}`);
            lines.push(seg.text);
            lines.push('');
        });
        return lines.join('\n');
    };
    
    // 生成 LRC
    const generateLrc = (segments) => {
        return segments.map(seg => `${formatLrcTime(seg.start)}${seg.text}`).join('\n');
    };
    
    // 下載檔案（按照 PDF 說明的方式，命名為 dl）
    const dl = (content, filename, ext) => {
        if (!content || !content.length) return;
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = Object.assign(document.createElement('a'), {
            href: url,
            download: filename + ext
        });
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };
    
    // 顯示狀態
    const showStatus = (message, type = 'info') => {
        const colors = {
            info: '#2196F3',
            success: '#4CAF50',
            error: '#F44336',
            warning: '#FF9800'
        };
        
        const icons = {
            info: 'ℹ️',
            success: '✅',
            error: '❌',
            warning: '⚠️'
        };
        
        const status = document.createElement('div');
        status.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
            z-index: 10000;
            max-width: 400px;
            border-left: 4px solid ${colors[type] || colors.info};
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
        `;
        status.textContent = `${icons[type] || icons.info} ${message}`;
        document.body.appendChild(status);
        
        setTimeout(() => {
            status.style.opacity = '0';
            status.style.transition = 'opacity 0.3s';
            setTimeout(() => status.remove(), 300);
        }, type === 'error' ? 5000 : 3000);
    };
    
    // 主程式
    (async () => {
        try {
            // 取得歌曲 ID
            const pathMatch = location.pathname.match(/\/song\/([^\/\?]+)/);
            if (!pathMatch) {
                showStatus('錯誤：請在 Suno 歌曲頁面使用此書籤', 'error');
                return;
            }
            
            const songId = pathMatch[1];
            showStatus(`正在處理歌曲: ${songId}...`, 'info');
            
            // 取得 Session Cookie（按照 PDF 說明，優先使用 __session）
            // 處理多個 __session Cookie 的情況，選擇最長的那個
            let sessionCookie = null;
            
            // 先嘗試 __session（可能有多個，選擇最長的）
            const sessionCookies = getAllCookies('__session');
            if (sessionCookies.length > 0) {
                // 選擇最長的 Cookie（通常是最完整的）
                sessionCookie = sessionCookies.sort((a, b) => b.length - a.length)[0];
                console.log(`✅ 找到 ${sessionCookies.length} 個 __session Cookie，使用最長的 (${sessionCookie.length} 字元)`);
            } else {
                // 如果找不到 __session，嘗試 _session
                const altSessions = getAllCookies('_session');
                if (altSessions.length > 0) {
                    sessionCookie = altSessions.sort((a, b) => b.length - a.length)[0];
                    console.log(`✅ 找到 _session Cookie (${sessionCookie.length} 字元)`);
                } else {
                    // 最後嘗試單個 Cookie 讀取
                    sessionCookie = getCookie('__session') || getCookie('_session');
                }
            }
            
            if (!sessionCookie) {
                showStatus('錯誤：找不到 __session cookie，請確認已登入 Suno', 'error');
                return;
            }
            
            // 如果找不到，嘗試其他可能的變體
            if (!sessionCookie) {
                const allCookies = listAllCookies();
                console.log('所有 Cookie:', allCookies);
                
                // 尋找包含 session 的 Cookie
                for (const cookie of allCookies) {
                    const name = cookie.name.toLowerCase();
                    if (name.includes('session') && cookie.value && cookie.value.length > 10) {
                        sessionCookie = cookie.value;
                        console.log(`使用 Cookie: ${cookie.name}`);
                        break;
                    }
                }
                
                // 如果還是找不到，嘗試其他可能的名稱
                if (!sessionCookie) {
                    const possibleNames = ['session', 'auth_session', 'session_id', '_session_U9tc', '_session_Jnx'];
                    for (const name of possibleNames) {
                        const cookie = getCookie(name);
                        if (cookie && cookie.length > 10) {
                            sessionCookie = cookie;
                            console.log(`使用 Cookie: ${name}`);
                            break;
                        }
                    }
                }
            }
            
            // 如果還是找不到，顯示除錯資訊
            if (!sessionCookie) {
                const allCookies = listAllCookies();
                const sessionCookies = allCookies.filter(c => 
                    c.name.toLowerCase().includes('session') || 
                    c.name.toLowerCase().includes('auth') ||
                    c.name.toLowerCase().includes('token')
                );
                
                console.error('找不到 Session Cookie');
                console.log('所有 Cookie 名稱:', allCookies.map(c => c.name));
                console.log('可能的 Session Cookie:', sessionCookies);
                
                let errorMsg = '錯誤：找不到 Session Cookie\n\n';
                errorMsg += '請確認：\n';
                errorMsg += '1. 已登入 Suno 帳號\n';
                errorMsg += '2. 在 suno.com 域名下使用此書籤\n';
                errorMsg += '3. 按 F12 開啟開發者工具\n';
                errorMsg += '4. 查看 Application > Cookies > https://suno.com\n';
                errorMsg += '5. 尋找名為 _session 的 Cookie\n\n';
                
                if (sessionCookies.length > 0) {
                    errorMsg += `找到相關 Cookie: ${sessionCookies.map(c => c.name).join(', ')}\n`;
                    errorMsg += '請檢查這些 Cookie 的 Value 是否為有效的 session token';
                }
                
                showStatus(errorMsg, 'error');
                return;
            }
            
            console.log('使用 Session Cookie (前 20 字元):', sessionCookie.substring(0, 20) + '...');
            
            // 取得檔名
            const filename = getSafeTitle(songId);
            showStatus('正在請求字幕資料...', 'info');
            
            // 請求 API（按照 PDF 說明的方式）
            const apiUrl = `https://studio-api.prod.suno.com/api/gen/${songId}/aligned_lyrics/v2/`;
            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${sessionCookie}`
                }
            });
            
            if (!response.ok) {
                // 按照 PDF 說明的方式顯示錯誤
                const errorMsg = `Suno API 回傳 ${response.status}，請嘗試在 suno.com 登出後重新登入再點一次書籤。`;
                alert(errorMsg);
                showStatus(errorMsg, 'error');
                return;
            }
            
            const data = await response.json();
            const words = data.aligned_words;
            
            if (!Array.isArray(words) || !words.length) {
                // 按照 PDF 說明，如果沒有資料就靜默返回
                return;
            }
            
            showStatus(`成功取得 ${words.length} 個單詞，正在處理...`, 'success');
            
            // 建立字幕段落
            const seg = buildSegments(words);
            if (seg.length === 0) {
                return; // 按照 PDF 說明，如果沒有資料就靜默返回
            }
            
            // 生成並下載檔案（按照 PDF 說明的方式）
            const srtContent = seg.map((s, i) => 
                `${i + 1}\n${formatSrtTime(s.start)} --> ${formatSrtTime(s.end)}\n${s.text}\n\n`
            ).join('');
            
            const lrcContent = seg.map(s => 
                `${formatLrcTime(s.start)}${s.text}`
            ).join('\n');
            
            dl(srtContent, filename, '.srt');
            dl(lrcContent, filename, '.lrc');
            
            showStatus(`✅ 下載完成！\n${filename}.srt\n${filename}.lrc`, 'success');
            
        } catch (error) {
            console.error('錯誤:', error);
            showStatus(`錯誤: ${error.message}`, 'error');
        }
    })();
})();
