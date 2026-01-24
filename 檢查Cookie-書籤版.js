// 在 Suno 頁面的 Console 中執行此程式碼，檢查所有 Cookie
// 複製以下程式碼，貼到 Console 中執行

(function() {
    console.log('=== 🔍 Suno Cookie 檢查工具 ===\n');
    
    // 取得所有 Cookie
    const allCookies = document.cookie.split(';').map(c => {
        const [name, ...valueParts] = c.trim().split('=');
        return {
            name: name.trim(),
            value: valueParts.join('='),
            length: (valueParts.join('=') || '').length
        };
    });
    
    console.log('📊 所有 Cookie 數量:', allCookies.length);
    console.log('\n📋 所有 Cookie 列表:');
    allCookies.forEach((cookie, i) => {
        console.log(`${i + 1}. ${cookie.name} (長度: ${cookie.length})`);
    });
    
    // 尋找可能的 Session Cookie
    const sessionCookies = allCookies.filter(c => {
        const name = c.name.toLowerCase();
        return name.includes('session') || 
               name.includes('auth') || 
               name.includes('token') ||
               name.includes('login');
    });
    
    console.log('\n🎯 可能的 Session Cookie:');
    if (sessionCookies.length > 0) {
        sessionCookies.forEach((cookie, i) => {
            const preview = cookie.value.substring(0, 50);
            console.log(`\n${i + 1}. ✅ ${cookie.name}`);
            console.log(`   長度: ${cookie.length} 字元`);
            console.log(`   預覽: ${preview}${cookie.value.length > 50 ? '...' : ''}`);
            console.log(`   建議使用: ${cookie.length > 50 ? '✅ 是' : '❌ 否（太短）'}`);
        });
    } else {
        console.log('❌ 找不到任何可能的 Session Cookie');
    }
    
    // 檢查特定的 Cookie 名稱
    console.log('\n🔍 檢查標準 Cookie 名稱:');
    const standardNames = ['__session', '_session', 'session', 'auth_session', 'session_id'];
    standardNames.forEach(name => {
        const cookie = allCookies.find(c => c.name === name);
        if (cookie) {
            console.log(`✅ 找到 ${name}: ${cookie.length} 字元`);
        } else {
            console.log(`❌ 找不到 ${name}`);
        }
    });
    
    // 檢查所有包含底線的 Cookie
    console.log('\n🔍 檢查包含底線的 Cookie:');
    const underscoreCookies = allCookies.filter(c => c.name.includes('_'));
    if (underscoreCookies.length > 0) {
        underscoreCookies.forEach(cookie => {
            console.log(`  - ${cookie.name} (${cookie.length} 字元)`);
        });
    } else {
        console.log('  沒有找到包含底線的 Cookie');
    }
    
    // 建議
    console.log('\n💡 建議:');
    if (sessionCookies.length > 0) {
        const bestCookie = sessionCookies.find(c => c.name === '__session') || 
                          sessionCookies.find(c => c.name === '_session') ||
                          sessionCookies[0];
        console.log(`✅ 建議使用的 Cookie: ${bestCookie.name}`);
        console.log(`   請確認這個 Cookie 的 Value 是否為有效的 session token`);
        console.log(`   如果書籤還是無法使用，可能需要更新書籤程式碼來使用這個 Cookie 名稱`);
    } else {
        console.log('⚠️  找不到 Session Cookie，可能的原因：');
        console.log('   1. 尚未登入 Suno');
        console.log('   2. Cookie 被瀏覽器阻擋');
        console.log('   3. 使用了隱私模式');
        console.log('   4. Cookie 儲存在不同的域名下');
    }
    
    console.log('\n=== 檢查完成 ===');
})();
