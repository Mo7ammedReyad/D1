import { Hono } from 'hono';
import { cors } from 'hono/cors';
import bcrypt from 'bcryptjs';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('*', cors());

// HTML Template مدمج في الكود
const htmlTemplate = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام إدارة المستخدمين</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            width: 100%;
            max-width: 400px;
            position: relative;
        }

        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 30px;
            text-align: center;
            color: white;
        }

        .header h1 {
            margin-bottom: 10px;
            font-size: 24px;
        }

        .header p {
            opacity: 0.9;
            font-size: 14px;
        }

        .form-container {
            padding: 30px;
        }

        .tab-buttons {
            display: flex;
            margin-bottom: 25px;
            background: #f5f5f5;
            border-radius: 10px;
            padding: 5px;
        }

        .tab-btn {
            flex: 1;
            padding: 12px;
            border: none;
            background: transparent;
            cursor: pointer;
            border-radius: 8px;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .tab-btn.active {
            background: #667eea;
            color: white;
            box-shadow: 0 2px 10px rgba(102, 126, 234, 0.3);
        }

        .form-group {
            margin-bottom: 20px;
        }

        .form-group label {
            display: block;
            margin-bottom: 8px;
            font-weight: 600;
            color: #333;
            font-size: 14px;
        }

        .form-group input {
            width: 100%;
            padding: 15px;
            border: 2px solid #e1e1e1;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #f9f9f9;
        }

        .form-group input:focus {
            outline: none;
            border-color: #667eea;
            background: white;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }

        .submit-btn {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-top: 10px;
        }

        .submit-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 20px rgba(102, 126, 234, 0.4);
        }

        .submit-btn:active {
            transform: translateY(0);
        }

        .message {
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            font-weight: 500;
            text-align: center;
        }

        .success {
            background: #d4edda;
            color: #155724;
            border: 1px solid #c3e6cb;
        }

        .error {
            background: #f8d7da;
            color: #721c24;
            border: 1px solid #f5c6cb;
        }

        .form-section {
            display: none;
        }

        .form-section.active {
            display: block;
        }

        .welcome-screen {
            text-align: center;
            padding: 30px;
        }

        .welcome-screen h2 {
            color: #667eea;
            margin-bottom: 15px;
            font-size: 24px;
        }

        .welcome-screen p {
            color: #666;
            margin-bottom: 25px;
            font-size: 16px;
        }

        .logout-btn {
            background: #6c757d;
            color: white;
            border: none;
            padding: 12px 25px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
        }

        .logout-btn:hover {
            background: #5a6268;
            transform: translateY(-1px);
        }

        .loading {
            display: none;
            text-align: center;
            color: #667eea;
            font-weight: 500;
        }

        .admin-panel {
            margin-top: 20px;
            padding: 20px;
            background: #f8f9fa;
            border-radius: 10px;
        }

        .admin-btn {
            background: #28a745;
            color: white;
            border: none;
            padding: 10px 20px;
            border-radius: 8px;
            cursor: pointer;
            font-weight: 500;
            margin-bottom: 15px;
        }

        .users-list {
            max-height: 200px;
            overflow-y: auto;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 10px;
            background: white;
        }

        .user-item {
            padding: 8px;
            border-bottom: 1px solid #eee;
            font-size: 14px;
        }

        .user-item:last-child {
            border-bottom: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🔐 نظام إدارة المستخدمين</h1>
            <p>مرحباً بك في لوحة التحكم</p>
        </div>
        
        <!-- نموذج التسجيل وتسجيل الدخول -->
        <div id="authContainer" class="form-container">
            <div class="tab-buttons">
                <button class="tab-btn active" onclick="switchTab('login')">تسجيل الدخول</button>
                <button class="tab-btn" onclick="switchTab('signup')">إنشاء حساب</button>
            </div>

            <div id="messageDiv"></div>

            <!-- نموذج تسجيل الدخول -->
            <div id="loginForm" class="form-section active">
                <form onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label>البريد الإلكتروني</label>
                        <input type="email" id="loginEmail" required placeholder="أدخل بريدك الإلكتروني">
                    </div>
                    <div class="form-group">
                        <label>كلمة المرور</label>
                        <input type="password" id="loginPassword" required placeholder="أدخل كلمة المرور">
                    </div>
                    <button type="submit" class="submit-btn">تسجيل الدخول</button>
                </form>
            </div>

            <!-- نموذج إنشاء حساب -->
            <div id="signupForm" class="form-section">
                <form onsubmit="handleSignup(event)">
                    <div class="form-group">
                        <label>البريد الإلكتروني</label>
                        <input type="email" id="signupEmail" required placeholder="أدخل بريدك الإلكتروني">
                    </div>
                    <div class="form-group">
                        <label>كلمة المرور</label>
                        <input type="password" id="signupPassword" required placeholder="أدخل كلمة مرور قوية" minlength="6">
                    </div>
                    <div class="form-group">
                        <label>تأكيد كلمة المرور</label>
                        <input type="password" id="confirmPassword" required placeholder="أعد إدخال كلمة المرور" minlength="6">
                    </div>
                    <button type="submit" class="submit-btn">إنشاء حساب</button>
                </form>
            </div>

            <div class="loading" id="loading">جاري المعالجة...</div>
        </div>

        <!-- شاشة الترحيب -->
        <div id="welcomeContainer" class="welcome-screen" style="display: none;">
            <h2>🎉 مرحباً بك!</h2>
            <p id="welcomeMessage">تم تسجيل الدخول بنجاح</p>
            
            <div class="admin-panel">
                <button class="admin-btn" onclick="loadUsers()">عرض جميع المستخدمين</button>
                <div id="usersList" class="users-list" style="display: none;"></div>
            </div>
            
            <button class="logout-btn" onclick="logout()">تسجيل الخروج</button>
        </div>
    </div>

    <script>
        let currentUser = null;

        function switchTab(tab) {
            // إخفاء جميع النماذج
            document.querySelectorAll('.form-section').forEach(section => {
                section.classList.remove('active');
            });
            
            // إزالة active من جميع الأزرار
            document.querySelectorAll('.tab-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            // إظهار النموذج المحدد
            document.getElementById(tab + 'Form').classList.add('active');
            event.target.classList.add('active');
            
            // مسح الرسائل
            document.getElementById('messageDiv').innerHTML = '';
        }

        function showMessage(message, type) {
            const messageDiv = document.getElementById('messageDiv');
            messageDiv.innerHTML = \`<div class="message \${type}">\${message}</div>\`;
        }

        function showLoading(show) {
            document.getElementById('loading').style.display = show ? 'block' : 'none';
        }

        async function handleSignup(event) {
            event.preventDefault();
            
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            if (password !== confirmPassword) {
                showMessage('كلمات المرور غير متطابقة', 'error');
                return;
            }
            
            showLoading(true);
            
            try {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    showMessage('تم إنشاء الحساب بنجاح! يمكنك الآن تسجيل الدخول', 'success');
                    setTimeout(() => switchTab('login'), 2000);
                } else {
                    showMessage(result.error || 'حدث خطأ في إنشاء الحساب', 'error');
                }
            } catch (error) {
                showMessage('حدث خطأ في الاتصال', 'error');
            }
            
            showLoading(false);
        }

        async function handleLogin(event) {
            event.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            showLoading(true);
            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });
                
                const result = await response.json();
                
                if (response.ok) {
                    currentUser = result.user;
                    showWelcome(currentUser.email);
                } else {
                    showMessage(result.error || 'بيانات تسجيل الدخول غير صحيحة', 'error');
                }
            } catch (error) {
                showMessage('حدث خطأ في الاتصال', 'error');
            }
            
            showLoading(false);
        }

        function showWelcome(email) {
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('welcomeContainer').style.display = 'block';
            document.getElementById('welcomeMessage').textContent = \`أهلاً وسهلاً \${email}\`;
        }

        function logout() {
            currentUser = null;
            document.getElementById('authContainer').style.display = 'block';
            document.getElementById('welcomeContainer').style.display = 'none';
            document.getElementById('usersList').style.display = 'none';
            
            // مسح النماذج
            document.querySelectorAll('input').forEach(input => input.value = '');
            document.getElementById('messageDiv').innerHTML = '';
        }

        async function loadUsers() {
            try {
                const response = await fetch('/users');
                const result = await response.json();
                
                if (response.ok) {
                    const usersList = document.getElementById('usersList');
                    usersList.innerHTML = '';
                    
                    if (result.users.length === 0) {
                        usersList.innerHTML = '<div class="user-item">لا توجد مستخدمين مسجلين</div>';
                    } else {
                        result.users.forEach((user, index) => {
                            usersList.innerHTML += \`
                                <div class="user-item">
                                    <strong>\${index + 1}.</strong> \${user.email} 
                                    <small style="color: #666;">(\${new Date(user.created_at).toLocaleDateString('ar-SA')})</small>
                                </div>
                            \`;
                        });
                    }
                    
                    usersList.style.display = 'block';
                } else {
                    alert('حدث خطأ في تحميل المستخدمين');
                }
            } catch (error) {
                alert('حدث خطأ في الاتصال');
            }
        }
    </script>
</body>
</html>
`;

// إنشاء جدول المستخدمين إذا لم يكن موجوداً
async function initDatabase(db: D1Database) {
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);
}

// الصفحة الرئيسية
app.get('/', (c) => {
  return c.html(htmlTemplate);
});

// تسجيل مستخدم جديد
app.post('/signup', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, 400);
    }

    if (password.length < 6) {
      return c.json({ error: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' }, 400);
    }

    // التأكد من وجود قاعدة البيانات
    await initDatabase(c.env.DB);

    // التحقق من وجود البريد الإلكتروني مسبقاً
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();

    if (existingUser) {
      return c.json({ error: 'هذا البريد الإلكتروني مسجل مسبقاً' }, 400);
    }

    // تشفير كلمة المرور
    const hashedPassword = await bcrypt.hash(password, 10);

    // إدخال المستخدم الجديد
    await c.env.DB.prepare(
      'INSERT INTO users (email, password) VALUES (?, ?)'
    ).bind(email, hashedPassword).run();

    return c.json({ 
      success: true, 
      message: 'تم إنشاء الحساب بنجاح' 
    });

  } catch (error) {
    console.error('خطأ في التسجيل:', error);
    return c.json({ error: 'حدث خطأ في الخادم' }, 500);
  }
});

// تسجيل الدخول
app.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: 'البريد الإلكتروني وكلمة المرور مطلوبان' }, 400);
    }

    // التأكد من وجود قاعدة البيانات
    await initDatabase(c.env.DB);

    // البحث عن المستخدم
    const user = await c.env.DB.prepare(
      'SELECT id, email, password FROM users WHERE email = ?'
    ).bind(email).first();

    if (!user) {
      return c.json({ error: 'بيانات تسجيل الدخول غير صحيحة' }, 401);
    }

    // التحقق من كلمة المرور
    const isValidPassword = await bcrypt.compare(password, user.password as string);

    if (!isValidPassword) {
      return c.json({ error: 'بيانات تسجيل الدخول غير صحيحة' }, 401);
    }

    return c.json({ 
      success: true, 
      message: 'تم تسجيل الدخول بنجاح',
      user: { 
        id: user.id, 
        email: user.email 
      }
    });

  } catch (error) {
    console.error('خطأ في تسجيل الدخول:', error);
    return c.json({ error: 'حدث خطأ في الخادم' }, 500);
  }
});

// عرض جميع المستخدمين (للأدمن)
app.get('/users', async (c) => {
  try {
    // التأكد من وجود قاعدة البيانات
    await initDatabase(c.env.DB);

    const users = await c.env.DB.prepare(
      'SELECT id, email, created_at FROM users ORDER BY created_at DESC'
    ).all();

    return c.json({ 
      success: true, 
      users: users.results 
    });

  } catch (error) {
    console.error('خطأ في جلب المستخدمين:', error);
    return c.json({ error: 'حدث خطأ في الخادم' }, 500);
  }
});

// معالجة المسارات غير الموجودة
app.notFound((c) => {
  return c.json({ error: 'المسار غير موجود' }, 404);
});

export default app;