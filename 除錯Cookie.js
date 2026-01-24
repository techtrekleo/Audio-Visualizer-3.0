// 除錯工具：檢查 Suno Cookie
// 在 Suno 頁面的 Console 中執行此程式碼，查看所有 Cookie

(function() {
    console.log('=== Suno Cookie 除錯工具 ===\n');
    
    // 取得所有 Cookie
    const allCookies = document.cookie.split(';').map(c => {
        const [name, ...valueParts] = c.trim().split('=');
        return {
            name: name,
            value: valueParts.join('='),
            full: c.trim()
        };
    });
    
    console.log('所有 Cookie 數量:', allCookies.length);
    console.log('所有 Cookie:', allCookies);
    console.log('\n');
    
    // 尋找可能的 Session Cookie
    const sessionCookies = allCookies.filter(c => 
        c.name.toLowerCase().includes('session') || 
        c.name.toLowerCase().includes('auth') ||
        c.name.toLowerCase().includes('token')
    );
    
    console.log('可能的 Session Cookie:', sessionCookies);
    console.log('\n');
    
    // 檢查特定的 Cookie 名稱
    const checkCookie = (name) => {
        const cookie = allCookies.find(c => c.name === name);
        if (cookie) {
            console.log(`✅ 找到 ${name}:`, cookie.value.substring(0, 50) + '...');
            return cookie.value;
        } else {
            console.log(`❌ 找不到 ${name}`);
            return null;
        }
    };
    
    console.log('檢查常見的 Cookie 名稱:');
    checkCookie('_session');
    checkCookie('__session');
    checkCookie('session');
    checkCookie('auth_session');
    checkCookie('session_id');
    checkCookie('_session_U9tc');
    checkCookie('_session_Jnx');
    
    console.log('\n=== 除錯完成 ===');
    console.log('如果看到 Cookie，請將名稱告訴開發者');
})();
