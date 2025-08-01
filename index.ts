import { Hono } from 'hono';
import { cors } from 'hono/cors';
import * as bcrypt from 'bcryptjs';

type Bindings = {
  DB: D1Database;
};

const app = new Hono<{ Bindings: Bindings }>();

// Enable CORS
app.use('/*', cors());

// HTML Template
const htmlTemplate = `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>نظام المحادثات</title>
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
        
        .form-container {
            padding: 40px;
        }
        
        h2 {
            color: #333;
            margin-bottom: 30px;
            text-align: center;
            font-size: 28px;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        label {
            display: block;
            margin-bottom: 8px;
            color: #555;
            font-weight: 500;
        }
        
        input, textarea {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s;
            background: #fafafa;
            font-family: inherit;
        }
        
        input:focus, textarea:focus {
            outline: none;
            border-color: #667eea;
            background: white;
        }
        
        button {
            width: 100%;
            padding: 15px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            border-radius: 10px;
            font-size: 18px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s;
            margin-top: 10px;
        }
        
        button:hover {
            transform: translateY(-2px);
        }
        
        button:active {
            transform: translateY(0);
        }
        
        .toggle-form {
            text-align: center;
            margin-top: 20px;
            color: #666;
        }
        
        .toggle-form a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            cursor: pointer;
        }
        
        .message {
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 20px;
            text-align: center;
            font-weight: 500;
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
        
        /* Chat Styles */
        .chat-container {
            width: 100%;
            max-width: 900px;
            height: 600px;
            background: white;
            border-radius: 20px;
            display: flex;
            overflow: hidden;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }
        
        .sidebar {
            width: 300px;
            background: #f8f9fa;
            border-left: 1px solid #e0e0e0;
            display: flex;
            flex-direction: column;
        }
        
        .user-info {
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
        }
        
        .user-info h3 {
            font-size: 18px;
            margin-bottom: 5px;
        }
        
        .user-id {
            font-size: 14px;
            opacity: 0.9;
            background: rgba(255,255,255,0.2);
            padding: 5px 10px;
            border-radius: 5px;
            display: inline-block;
            margin-top: 10px;
        }
        
        .new-chat {
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .new-chat input {
            margin-bottom: 10px;
        }
        
        .new-chat button {
            background: #28a745;
            font-size: 16px;
            padding: 10px;
        }
        
        .conversations-list {
            flex: 1;
            overflow-y: auto;
            padding: 10px;
        }
        
        .conversation-item {
            padding: 15px;
            border-radius: 10px;
            margin-bottom: 10px;
            cursor: pointer;
            transition: background 0.3s;
            border: 1px solid #e0e0e0;
        }
        
        .conversation-item:hover {
            background: #f0f0f0;
        }
        
        .conversation-item.active {
            background: #e8eaf6;
            border-color: #667eea;
        }
        
        .chat-area {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .chat-header {
            padding: 20px;
            background: #f8f9fa;
            border-bottom: 1px solid #e0e0e0;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .messages-container {
            flex: 1;
            overflow-y: auto;
            padding: 20px;
            background: #fafafa;
        }
        
        .message-item {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-end;
        }
        
        .message-item.sent {
            justify-content: flex-start;
            flex-direction: row-reverse;
        }
        
        .message-bubble {
            max-width: 70%;
            padding: 12px 18px;
            border-radius: 18px;
            position: relative;
        }
        
        .message-item.received .message-bubble {
            background: white;
            border: 1px solid #e0e0e0;
            margin-right: 10px;
        }
        
        .message-item.sent .message-bubble {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            margin-left: 10px;
        }
        
        .message-time {
            font-size: 12px;
            color: #999;
            margin-top: 5px;
        }
        
        .message-item.sent .message-time {
            color: rgba(255,255,255,0.8);
            text-align: left;
        }
        
        .message-input-container {
            padding: 20px;
            background: white;
            border-top: 1px solid #e0e0e0;
            display: flex;
            gap: 10px;
        }
        
        .message-input {
            flex: 1;
        }
        
        .send-button {
            width: auto;
            padding: 12px 30px;
            margin: 0;
        }
        
        .logout-btn {
            background: #dc3545;
            padding: 8px 20px;
            font-size: 14px;
            width: auto;
            margin-top: 15px;
        }
        
        .empty-chat {
            text-align: center;
            color: #999;
            padding: 40px;
        }
        
        .loading {
            display: none;
            text-align: center;
            margin-top: 10px;
            color: #667eea;
        }
        
        @media (max-width: 768px) {
            .chat-container {
                flex-direction: column;
                height: 100vh;
                max-width: 100%;
                border-radius: 0;
            }
            
            .sidebar {
                width: 100%;
                height: auto;
                border-left: none;
                border-bottom: 1px solid #e0e0e0;
            }
            
            .chat-area {
                height: calc(100vh - 300px);
            }
        }
    </style>
</head>
<body>
    <div class="container" id="authContainer">
        <div id="authForms">
            <!-- Login Form -->
            <div id="loginForm" class="form-container">
                <h2>تسجيل الدخول</h2>
                <div id="loginMessage"></div>
                <form onsubmit="handleLogin(event)">
                    <div class="form-group">
                        <label for="loginEmail">البريد الإلكتروني</label>
                        <input type="email" id="loginEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="loginPassword">كلمة المرور</label>
                        <input type="password" id="loginPassword" required>
                    </div>
                    <button type="submit">دخول</button>
                    <div class="loading" id="loginLoading">جاري تسجيل الدخول...</div>
                </form>
                <div class="toggle-form">
                    ليس لديك حساب؟ <a onclick="toggleForms()">سجل الآن</a>
                </div>
            </div>
            
            <!-- Signup Form -->
            <div id="signupForm" class="form-container" style="display: none;">
                <h2>إنشاء حساب جديد</h2>
                <div id="signupMessage"></div>
                <form onsubmit="handleSignup(event)">
                    <div class="form-group">
                        <label for="signupEmail">البريد الإلكتروني</label>
                        <input type="email" id="signupEmail" required>
                    </div>
                    <div class="form-group">
                        <label for="signupPassword">كلمة المرور</label>
                        <input type="password" id="signupPassword" required minlength="6">
                    </div>
                    <button type="submit">تسجيل</button>
                    <div class="loading" id="signupLoading">جاري إنشاء الحساب...</div>
                </form>
                <div class="toggle-form">
                    لديك حساب بالفعل؟ <a onclick="toggleForms()">سجل دخول</a>
                </div>
            </div>
        </div>
    </div>
    
    <!-- Chat Interface -->
    <div class="chat-container" id="chatContainer" style="display: none;">
        <div class="sidebar">
            <div class="user-info">
                <h3>مرحباً</h3>
                <div id="currentUserEmail"></div>
                <div class="user-id">رقمك: <span id="currentUserId"></span></div>
                <button class="logout-btn" onclick="logout()">تسجيل خروج</button>
            </div>
            
            <div class="new-chat">
                <h4>محادثة جديدة</h4>
                <input type="text" id="newChatUserId" placeholder="أدخل رقم المستخدم">
                <button onclick="startNewChat()">بدء محادثة</button>
            </div>
            
            <div class="conversations-list" id="conversationsList">
                <!-- Conversations will be loaded here -->
            </div>
        </div>
        
        <div class="chat-area">
            <div id="emptyChatState" class="empty-chat">
                <h3>اختر محادثة أو ابدأ محادثة جديدة</h3>
            </div>
            
            <div id="activeChatArea" style="display: none;">
                <div class="chat-header">
                    <h3 id="chatWithUser">المحادثة مع...</h3>
                </div>
                
                <div class="messages-container" id="messagesContainer">
                    <!-- Messages will be loaded here -->
                </div>
                
                <div class="message-input-container">
                    <input type="text" class="message-input" id="messageInput" placeholder="اكتب رسالتك..." onkeypress="handleMessageKeyPress(event)">
                    <button class="send-button" onclick="sendMessage()">إرسال</button>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let currentUser = null;
        let activeConversation = null;
        let pollInterval = null;
        
        // Check if user is logged in
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            currentUser = JSON.parse(savedUser);
            showChatInterface();
        }
        
        function toggleForms() {
            const loginForm = document.getElementById('loginForm');
            const signupForm = document.getElementById('signupForm');
            
            if (loginForm.style.display === 'none') {
                loginForm.style.display = 'block';
                signupForm.style.display = 'none';
            } else {
                loginForm.style.display = 'none';
                signupForm.style.display = 'block';
            }
        }
        
        async function handleLogin(event) {
            event.preventDefault();
            
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            const messageDiv = document.getElementById('loginMessage');
            const loadingDiv = document.getElementById('loginLoading');
            
            loadingDiv.style.display = 'block';
            messageDiv.innerHTML = '';
            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                loadingDiv.style.display = 'none';
                
                if (data.success) {
                    messageDiv.innerHTML = '<div class="message success">تم تسجيل الدخول بنجاح!</div>';
                    currentUser = data.user;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    setTimeout(() => showChatInterface(), 1000);
                } else {
                    messageDiv.innerHTML = '<div class="message error">' + data.message + '</div>';
                }
            } catch (error) {
                loadingDiv.style.display = 'none';
                messageDiv.innerHTML = '<div class="message error">حدث خطأ في الاتصال بالخادم</div>';
            }
        }
        
        async function handleSignup(event) {
            event.preventDefault();
            
            const email = document.getElementById('signupEmail').value;
            const password = document.getElementById('signupPassword').value;
            const messageDiv = document.getElementById('signupMessage');
            const loadingDiv = document.getElementById('signupLoading');
            
            loadingDiv.style.display = 'block';
            messageDiv.innerHTML = '';
            
            try {
                const response = await fetch('/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                loadingDiv.style.display = 'none';
                
                if (data.success) {
                    messageDiv.innerHTML = '<div class="message success">تم إنشاء الحساب بنجاح! رقمك هو: ' + data.user.id + '</div>';
                    currentUser = data.user;
                    localStorage.setItem('currentUser', JSON.stringify(currentUser));
                    setTimeout(() => showChatInterface(), 2000);
                } else {
                    messageDiv.innerHTML = '<div class="message error">' + data.message + '</div>';
                }
            } catch (error) {
                loadingDiv.style.display = 'none';
                messageDiv.innerHTML = '<div class="message error">حدث خطأ في الاتصال بالخادم</div>';
            }
        }
        
        function showChatInterface() {
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('chatContainer').style.display = 'flex';
            document.getElementById('currentUserEmail').textContent = currentUser.email;
            document.getElementById('currentUserId').textContent = currentUser.id;
            
            loadConversations();
            // Poll for new messages every 3 seconds
            pollInterval = setInterval(pollMessages, 3000);
        }
        
        async function loadConversations() {
            try {
                const response = await fetch('/conversations?userId=' + currentUser.id);
                const data = await response.json();
                
                if (data.success) {
                    const conversationsList = document.getElementById('conversationsList');
                    conversationsList.innerHTML = '';
                    
                    data.conversations.forEach(conv => {
                        const div = document.createElement('div');
                        div.className = 'conversation-item';
                        div.onclick = () => selectConversation(conv);
                        div.innerHTML = \`
                            <strong>محادثة مع: \${conv.otherUserEmail}</strong>
                            <div style="font-size: 14px; color: #666;">رقم المستخدم: \${conv.otherUserId}</div>
                        \`;
                        conversationsList.appendChild(div);
                    });
                }
            } catch (error) {
                console.error('Error loading conversations:', error);
            }
        }
        
        async function startNewChat() {
            const recipientId = document.getElementById('newChatUserId').value;
            if (!recipientId) {
                alert('الرجاء إدخال رقم المستخدم');
                return;
            }
            
            try {
                const response = await fetch('/user/' + recipientId);
                const data = await response.json();
                
                if (data.success) {
                    selectConversation({
                        otherUserId: parseInt(recipientId),
                        otherUserEmail: data.user.email
                    });
                    document.getElementById('newChatUserId').value = '';
                    loadConversations();
                } else {
                    alert('لم يتم العثور على المستخدم');
                }
            } catch (error) {
                alert('حدث خطأ في البحث عن المستخدم');
            }
        }
        
        function selectConversation(conversation) {
            activeConversation = conversation;
            document.getElementById('emptyChatState').style.display = 'none';
            document.getElementById('activeChatArea').style.display = 'flex';
            document.getElementById('chatWithUser').textContent = 'المحادثة مع ' + conversation.otherUserEmail;
            
            // Update active state in sidebar
            document.querySelectorAll('.conversation-item').forEach(item => {
                item.classList.remove('active');
            });
            event.currentTarget?.classList.add('active');
            
            loadMessages();
        }
        
        async function loadMessages() {
            if (!activeConversation) return;
            
            try {
                const response = await fetch(\`/messages?senderId=\${currentUser.id}&recipientId=\${activeConversation.otherUserId}\`);
                const data = await response.json();
                
                if (data.success) {
                    const messagesContainer = document.getElementById('messagesContainer');
                    messagesContainer.innerHTML = '';
                    
                    data.messages.forEach(msg => {
                        const messageDiv = document.createElement('div');
                        messageDiv.className = 'message-item ' + (msg.sender_id === currentUser.id ? 'sent' : 'received');
                        
                        const time = new Date(msg.created_at).toLocaleTimeString('ar-EG', {
                            hour: '2-digit',
                            minute: '2-digit'
                        });
                        
                        messageDiv.innerHTML = \`
                            <div class="message-bubble">
                                <div>\${msg.content}</div>
                                <div class="message-time">\${time}</div>
                            </div>
                        \`;
                        
                        messagesContainer.appendChild(messageDiv);
                    });
                    
                    // Scroll to bottom
                    messagesContainer.scrollTop = messagesContainer.scrollHeight;
                }
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        }
        
        async function sendMessage() {
            const messageInput = document.getElementById('messageInput');
            const content = messageInput.value.trim();
            
            if (!content || !activeConversation) return;
            
            try {
                const response = await fetch('/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        senderId: currentUser.id,
                        recipientId: activeConversation.otherUserId,
                        content: content
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    messageInput.value = '';
                    loadMessages();
                } else {
                    alert('فشل إرسال الرسالة');
                }
            } catch (error) {
                console.error('Error sending message:', error);
                alert('حدث خطأ في إرسال الرسالة');
            }
        }
        
        function handleMessageKeyPress(event) {
            if (event.key === 'Enter') {
                sendMessage();
            }
        }
        
        async function pollMessages() {
            if (activeConversation) {
                await loadMessages();
            }
        }
        
        function logout() {
            localStorage.removeItem('currentUser');
            currentUser = null;
            activeConversation = null;
            
            if (pollInterval) {
                clearInterval(pollInterval);
                pollInterval = null;
            }
            
            document.getElementById('authContainer').style.display = 'flex';
            document.getElementById('chatContainer').style.display = 'none';
            
            // Clear form fields
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
            
            // Clear messages
            document.getElementById('loginMessage').innerHTML = '';
            document.getElementById('signupMessage').innerHTML = '';
        }
    </script>
</body>
</html>
`;

// Initialize database
async function initDB(db: D1Database) {
  try {
    // Create users table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
    
    // Create messages table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        recipient_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (recipient_id) REFERENCES users (id)
      )
    `).run();
    
    // Create index for faster message queries
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_messages_users 
      ON messages (sender_id, recipient_id)
    `).run();
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Routes
app.get('/', (c) => {
  return c.html(htmlTemplate);
});

app.post('/signup', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Validate input
    if (!email || !password) {
      return c.json({ success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }
    
    if (password.length < 6) {
      return c.json({ success: false, message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
    }
    
    // Initialize DB
    await initDB(c.env.DB);
    
    // Check if user already exists
    const existingUser = await c.env.DB.prepare(
      'SELECT id FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (existingUser) {
      return c.json({ success: false, message: 'هذا البريد الإلكتروني مسجل بالفعل' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const result = await c.env.DB.prepare(
      'INSERT INTO users (email, password) VALUES (?, ?)'
    ).bind(email, hashedPassword).run();
    
    // Get the new user's ID
    const newUser = await c.env.DB.prepare(
      'SELECT id, email FROM users WHERE email = ?'
    ).bind(email).first();
    
    return c.json({ 
      success: true, 
      message: 'تم إنشاء الحساب بنجاح',
      user: newUser
    });
  } catch (error) {
    console.error('Signup error:', error);
    return c.json({ success: false, message: 'حدث خطأ في إنشاء الحساب' });
  }
});

app.post('/login', async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    // Validate input
    if (!email || !password) {
      return c.json({ success: false, message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
    }
    
    // Initialize DB
    await initDB(c.env.DB);
    
    // Get user
    const user = await c.env.DB.prepare(
      'SELECT * FROM users WHERE email = ?'
    ).bind(email).first();
    
    if (!user) {
      return c.json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
    }
    
    // Verify password
    const isValid = await bcrypt.compare(password, user.password as string);
    
    if (!isValid) {
      return c.json({ success: false, message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
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
    console.error('Login error:', error);
    return c.json({ success: false, message: 'حدث خطأ في تسجيل الدخول' });
  }
});

app.get('/user/:id', async (c) => {
  try {
    const userId = c.req.param('id');
    
    // Initialize DB
    await initDB(c.env.DB);
    
    const user = await c.env.DB.prepare(
      'SELECT id, email FROM users WHERE id = ?'
    ).bind(userId).first();
    
    if (!user) {
      return c.json({ success: false, message: 'المستخدم غير موجود' });
    }
    
    return c.json({ success: true, user });
  } catch (error) {
    console.error('Get user error:', error);
    return c.json({ success: false, message: 'حدث خطأ في جلب بيانات المستخدم' });
  }
});

app.get('/conversations', async (c) => {
  try {
    const userId = c.req.query('userId');
    
    if (!userId) {
      return c.json({ success: false, message: 'User ID is required' });
    }
    
    // Initialize DB
    await initDB(c.env.DB);
    
    // Get all unique conversations for the user
    const conversations = await c.env.DB.prepare(`
      SELECT DISTINCT 
        CASE 
          WHEN m.sender_id = ? THEN m.recipient_id 
          ELSE m.sender_id 
        END as other_user_id,
        u.email as other_user_email
      FROM messages m
      JOIN users u ON u.id = CASE 
       // تكملة index.ts من السطر الأخير
        WHEN m.sender_id = ? THEN m.recipient_id 
        ELSE m.sender_id 
      END
      WHERE m.sender_id = ? OR m.recipient_id = ?
      ORDER BY u.email
    `).bind(userId, userId, userId, userId, userId).all();
    
    return c.json({ 
      success: true, 
      conversations: conversations.results.map(conv => ({
        otherUserId: conv.other_user_id,
        otherUserEmail: conv.other_user_email
      }))
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return c.json({ success: false, message: 'حدث خطأ في جلب المحادثات' });
  }
});

app.get('/messages', async (c) => {
  try {
    const senderId = c.req.query('senderId');
    const recipientId = c.req.query('recipientId');
    
    if (!senderId || !recipientId) {
      return c.json({ success: false, message: 'Sender and recipient IDs are required' });
    }
    
    // Initialize DB
    await initDB(c.env.DB);
    
    // Get messages between two users
    const messages = await c.env.DB.prepare(`
      SELECT * FROM messages 
      WHERE (sender_id = ? AND recipient_id = ?) 
         OR (sender_id = ? AND recipient_id = ?)
      ORDER BY created_at ASC
    `).bind(senderId, recipientId, recipientId, senderId).all();
    
    return c.json({ 
      success: true, 
      messages: messages.results 
    });
  } catch (error) {
    console.error('Get messages error:', error);
    return c.json({ success: false, message: 'حدث خطأ في جلب الرسائل' });
  }
});

app.post('/send-message', async (c) => {
  try {
    const { senderId, recipientId, content } = await c.req.json();
    
    // Validate input
    if (!senderId || !recipientId || !content) {
      return c.json({ success: false, message: 'جميع الحقول مطلوبة' });
    }
    
    // Initialize DB
    await initDB(c.env.DB);
    
    // Check if recipient exists
    const recipient = await c.env.DB.prepare(
      'SELECT id FROM users WHERE id = ?'
    ).bind(recipientId).first();
    
    if (!recipient) {
      return c.json({ success: false, message: 'المستخدم المستقبل غير موجود' });
    }
    
    // Insert message
    await c.env.DB.prepare(
      'INSERT INTO messages (sender_id, recipient_id, content) VALUES (?, ?, ?)'
    ).bind(senderId, recipientId, content).run();
    
    return c.json({ success: true, message: 'تم إرسال الرسالة بنجاح' });
  } catch (error) {
    console.error('Send message error:', error);
    return c.json({ success: false, message: 'حدث خطأ في إرسال الرسالة' });
  }
});

app.get('/users', async (c) => {
  try {
    // Initialize DB
    await initDB(c.env.DB);
    
    // Get all users (excluding passwords)
    const users = await c.env.DB.prepare(
      'SELECT id, email, created_at FROM users'
    ).all();
    
    return c.json({ success: true, users: users.results });
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ success: false, message: 'حدث خطأ في جلب المستخدمين' });
  }
});

export default app;