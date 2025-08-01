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
    <title>نظام الدردشة</title>
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
            padding: 20px;
        }
        
        .container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            width: 100%;
            max-width: 400px;
            margin: 0 auto;
            position: relative;
        }
        
        .chat-container {
            background: white;
            border-radius: 20px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
            overflow: hidden;
            width: 100%;
            max-width: 800px;
            margin: 0 auto;
            height: 90vh;
            display: flex;
            flex-direction: column;
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
        
        input {
            width: 100%;
            padding: 12px 15px;
            border: 2px solid #e0e0e0;
            border-radius: 10px;
            font-size: 16px;
            transition: all 0.3s;
            background: #fafafa;
        }
        
        input:focus {
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
        
        .loading {
            display: none;
            text-align: center;
            margin-top: 10px;
            color: #667eea;
        }
        
        /* Chat Styles */
        .chat-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .user-info {
            display: flex;
            align-items: center;
            gap: 15px;
        }
        
        .user-id {
            background: rgba(255, 255, 255, 0.2);
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 14px;
        }
        
        .logout-btn {
            background: #dc3545;
            padding: 8px 20px;
            border-radius: 20px;
            border: none;
            color: white;
            cursor: pointer;
            font-size: 14px;
        }
        
        .chat-main {
            display: flex;
            flex: 1;
            overflow: hidden;
        }
        
        .chat-sidebar {
            width: 300px;
            border-left: 1px solid #e0e0e0;
            background: #f8f9fa;
            display: flex;
            flex-direction: column;
        }
        
        .search-container {
            padding: 20px;
            border-bottom: 1px solid #e0e0e0;
        }
        
        .search-input {
            width: 100%;
            padding: 10px 15px;
            border: 1px solid #ddd;
            border-radius: 25px;
            font-size: 14px;
        }
        
        .conversations {
            flex: 1;
            overflow-y: auto;
        }
        
        .conversation-item {
            padding: 15px 20px;
            border-bottom: 1px solid #e0e0e0;
            cursor: pointer;
            transition: background 0.2s;
        }
        
        .conversation-item:hover {
            background: #e9ecef;
        }
        
        .conversation-item.active {
            background: #667eea;
            color: white;
        }
        
        .conversation-name {
            font-weight: 600;
            margin-bottom: 5px;
        }
        
        .conversation-preview {
            font-size: 12px;
            color: #666;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        
        .conversation-item.active .conversation-preview {
            color: rgba(255, 255, 255, 0.8);
        }
        
        .chat-content {
            flex: 1;
            display: flex;
            flex-direction: column;
        }
        
        .chat-messages {
            flex: 1;
            padding: 20px;
            overflow-y: auto;
            background: #f8f9fa;
        }
        
        .message-item {
            margin-bottom: 15px;
            display: flex;
            align-items: flex-start;
        }
        
        .message-item.sent {
            flex-direction: row-reverse;
        }
        
        .message-bubble {
            max-width: 70%;
            padding: 12px 18px;
            border-radius: 18px;
            word-wrap: break-word;
        }
        
        .message-item.received .message-bubble {
            background: white;
            color: #333;
            border-bottom-right-radius: 4px;
        }
        
        .message-item.sent .message-bubble {
            background: #667eea;
            color: white;
            border-bottom-left-radius: 4px;
        }
        
        .message-time {
            font-size: 11px;
            color: #999;
            margin: 5px 10px 0;
        }
        
        .message-input-container {
            padding: 20px;
            border-top: 1px solid #e0e0e0;
            background: white;
        }
        
        .message-input-form {
            display: flex;
            gap: 10px;
            align-items: center;
        }
        
        .message-input {
            flex: 1;
            padding: 12px 18px;
            border: 1px solid #ddd;
            border-radius: 25px;
            font-size: 14px;
            resize: none;
            outline: none;
        }
        
        .send-btn {
            background: #667eea;
            color: white;
            border: none;
            border-radius: 50%;
            width: 45px;
            height: 45px;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 18px;
        }
        
        .empty-chat {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100%;
            color: #666;
            text-align: center;
        }
        
        .empty-chat h3 {
            margin-bottom: 10px;
            color: #333;
        }
        
        @media (max-width: 768px) {
            .chat-main {
                flex-direction: column;
            }
            
            .chat-sidebar {
                width: 100%;
                height: 300px;
            }
            
            .chat-container {
                height: 100vh;
                border-radius: 0;
                margin: 0;
            }
            
            body {
                padding: 0;
            }
        }
        
        .search-results {
            background: white;
            border: 1px solid #ddd;
            border-radius: 10px;
            margin-top: 10px;
            max-height: 200px;
            overflow-y: auto;
        }
        
        .search-result-item {
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .search-result-item:hover {
            background: #f8f9fa;
        }
        
        .search-result-item:last-child {
            border-bottom: none;
        }
    </style>
</head>
<body>
    <!-- Authentication Forms -->
    <div id="authContainer" class="container">
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
    <div id="chatContainer" class="chat-container" style="display: none;">
        <div class="chat-header">
            <div class="user-info">
                <div>
                    <div>مرحباً، <span id="userEmail"></span></div>
                    <div class="user-id">رقمك: <span id="userId"></span></div>
                </div>
            </div>
            <button class="logout-btn" onclick="logout()">تسجيل خروج</button>
        </div>
        
        <div class="chat-main">
            <div class="chat-sidebar">
                <div class="search-container">
                    <input type="text" class="search-input" id="searchInput" placeholder="ابحث برقم المستخدم..." onkeyup="searchUsers()">
                    <div id="searchResults" class="search-results" style="display: none;"></div>
                </div>
                <div class="conversations" id="conversationsList">
                    <!-- Conversations will be loaded here -->
                </div>
            </div>
            
            <div class="chat-content">
                <div id="emptyChat" class="empty-chat">
                    <h3>مرحباً بك في نظام الدردشة</h3>
                    <p>اختر محادثة من القائمة أو ابحث عن مستخدم جديد</p>
                </div>
                
                <div id="chatArea" style="display: none;">
                    <div class="chat-messages" id="messagesContainer">
                        <!-- Messages will be loaded here -->
                    </div>
                    
                    <div class="message-input-container">
                        <form class="message-input-form" onsubmit="sendMessage(event)">
                            <textarea class="message-input" id="messageInput" placeholder="اكتب رسالتك..." rows="1" onkeypress="handleEnterKey(event)"></textarea>
                            <button type="submit" class="send-btn">➤</button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    </div>
    
    <script>
        let currentUser = null;
        let currentConversation = null;
        let messagesPolling = null;
        
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
                    messageDiv.innerHTML = '<div class="message success">تم إنشاء الحساب بنجاح!</div>';
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
        
        function showChatInterface() {
            document.getElementById('authContainer').style.display = 'none';
            document.getElementById('chatContainer').style.display = 'flex';
            document.getElementById('userEmail').textContent = currentUser.email;
            document.getElementById('userId').textContent = currentUser.user_id;
            
            loadConversations();
            startMessagesPolling();
        }
        
        function logout() {
            localStorage.removeItem('currentUser');
            currentUser = null;
            currentConversation = null;
            
            if (messagesPolling) {
                clearInterval(messagesPolling);
                messagesPolling = null;
            }
            
            document.getElementById('authContainer').style.display = 'block';
            document.getElementById('chatContainer').style.display = 'none';
            document.getElementById('loginForm').style.display = 'block';
            document.getElementById('signupForm').style.display = 'none';
            
            // Clear form fields
            document.getElementById('loginEmail').value = '';
            document.getElementById('loginPassword').value = '';
            document.getElementById('signupEmail').value = '';
            document.getElementById('signupPassword').value = '';
            
            // Clear messages
            document.getElementById('loginMessage').innerHTML = '';
            document.getElementById('signupMessage').innerHTML = '';
        }
        
        async function loadConversations() {
            try {
                const response = await fetch('/conversations', {
                    headers: {
                        'X-User-ID': currentUser.id.toString()
                    }
                });
                const data = await response.json();
                
                if (data.success) {
                    displayConversations(data.conversations);
                }
            } catch (error) {
                console.error('Error loading conversations:', error);
            }
        }
        
        function displayConversations(conversations) {
            const container = document.getElementById('conversationsList');
            container.innerHTML = '';
            
            conversations.forEach(conv => {
                const item = document.createElement('div');
                item.className = 'conversation-item';
                item.onclick = () => openConversation(conv.other_user_id, conv.other_user_email);
                
                item.innerHTML = \`
                    <div class="conversation-name">\${conv.other_user_email}</div>
                    <div class="conversation-preview">رقم المستخدم: \${conv.other_user_id}</div>
                \`;
                
                container.appendChild(item);
            });
        }
        
        async function searchUsers() {
            const query = document.getElementById('searchInput').value.trim();
            const resultsContainer = document.getElementById('searchResults');
            
            if (query.length < 1) {
                resultsContainer.style.display = 'none';
                return;
            }
            
            try {
                const response = await fetch(\`/search-users?q=\${encodeURIComponent(query)}\`, {
                    headers: {
                        'X-User-ID': currentUser.id.toString()
                    }
                });
                const data = await response.json();
                
                if (data.success && data.users.length > 0) {
                    displaySearchResults(data.users);
                } else {
                    resultsContainer.innerHTML = '<div class="search-result-item">لا توجد نتائج</div>';
                    resultsContainer.style.display = 'block';
                }
            } catch (error) {
                console.error('Error searching users:', error);
            }
        }
        
        function displaySearchResults(users) {
            const container = document.getElementById('searchResults');
            container.innerHTML = '';
            
            users.forEach(user => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                item.onclick = () => {
                    openConversation(user.user_id, user.email);
                    container.style.display = 'none';
                    document.getElementById('searchInput').value = '';
                };
                
                item.innerHTML = \`
                    <div>\${user.email}</div>
                    <div style="font-size: 12px; color: #666;">رقم: \${user.user_id}</div>
                \`;
                
                container.appendChild(item);
            });
            
            container.style.display = 'block';
        }
        
        async function openConversation(otherUserId, otherUserEmail) {
            currentConversation = { otherUserId, otherUserEmail };
            
            // Update UI
            document.getElementById('emptyChat').style.display = 'none';
            document.getElementById('chatArea').style.display = 'flex';
            
            // Highlight selected conversation
            const conversationItems = document.querySelectorAll('.conversation-item');
            conversationItems.forEach(item => item.classList.remove('active'));
            
            // Load messages
            await loadMessages();
        }
        
        async function loadMessages() {
            if (!currentConversation) return;
            
            try {
                const response = await fetch(\`/messages?other_user_id=\${currentConversation.otherUserId}\`, {
                    headers: {
                        'X-User-ID': currentUser.id.toString()
                    }
                });
                const data = await response.json();
                
                if (data.success) {
                    displayMessages(data.messages);
                }
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        }
        
        function displayMessages(messages) {
            const container = document.getElementById('messagesContainer');
            container.innerHTML = '';
            
            messages.forEach(message => {
                const messageItem = document.createElement('div');
                messageItem.className = \`message-item \${message.sender_id === currentUser.id ? 'sent' : 'received'}\`;
                
                const time = new Date(message.created_at).toLocaleTimeString('ar-SA', {
                    hour: '2-digit',
                    minute: '2-digit'
                });
                
                messageItem.innerHTML = \`
                    <div class="message-bubble">\${message.content}</div>
                    <div class="message-time">\${time}</div>
                \`;
                
                container.appendChild(messageItem);
            });
            
            // Scroll to bottom
            container.scrollTop = container.scrollHeight;
        }
        
        async function sendMessage(event) {
            event.preventDefault();
            
            if (!currentConversation) return;
            
            const messageInput = document.getElementById('messageInput');
            const content = messageInput.value.trim();
            
            if (!content) return;
            
            try {
                const response = await fetch('/send-message', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-ID': currentUser.id.toString()
                    },
                    body: JSON.stringify({
                        receiver_id: currentConversation.otherUserId,
                        content: content
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    messageInput.value = '';
                    await loadMessages();
                    await loadConversations();
                }
            } catch (error) {
                console.error('Error sending message:', error);
            }
        }
        
        function handleEnterKey(event) {
            if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage(event);
            }
        }
        
        function startMessagesPolling() {
            if (messagesPolling) {
                clearInterval(messagesPolling);
            }
            
            messagesPolling = setInterval(async () => {
                if (currentConversation) {
                    await loadMessages();
                }
                await loadConversations();
            }, 3000); // Poll every 3 seconds
        }
        
        // Hide search results when clicking outside
        document.addEventListener('click', function(event) {
            const searchInput = document.getElementById('searchInput');
            const searchResults = document.getElementById('searchResults');
            
            if (!searchInput.contains(event.target) && !searchResults.contains(event.target)) {
                searchResults.style.display = 'none';
            }
        });
    </script>
</body>
</html>
`;

// Generate unique user ID
function generateUserId(): string {
  return Math.floor(10000000 + Math.random() * 90000000).toString();
}

// Initialize database
async function initDB(db: D1Database) {
  try {
    // Users table with user_id
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    // Messages table
    await db.prepare(`
      CREATE TABLE IF NOT EXISTS messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sender_id INTEGER NOT NULL,
        receiver_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (sender_id) REFERENCES users (id),
        FOREIGN KEY (receiver_id) REFERENCES users (id)
      )
    `).run();

    // Index for faster message queries
    await db.prepare(`
      CREATE INDEX IF NOT EXISTS idx_messages_users 
      ON messages (sender_id, receiver_id, created_at)
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
    
    // Generate unique user ID
    let userId: string;
    let isUnique = false;
    
    while (!isUnique) {
      userId = generateUserId();
      const existingId = await c.env.DB.prepare(
        'SELECT id FROM users WHERE user_id = ?'
      ).bind(userId).first();
      
      if (!existingId) {
        isUnique = true;
      }
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Insert new user
    const result = await c.env.DB.prepare(
      'INSERT INTO users (user_id, email, password) VALUES (?, ?, ?)'
    ).bind(userId!, hashedPassword, email).run();
    
    // Get the created user
    const newUser = await c.env.DB.prepare(
      'SELECT id, user_id, email, created_at FROM users WHERE id = ?'
    ).bind(result.meta.last_row_id).first();
    
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
    
    // Return user data without password
    const userData = {
      id: user.id,
      user_id: user.user_id,
      email: user.email,
      created_at: user.created_at
    };
    
    return c.json({ 
      success: true, 
      message: 'تم تسجيل الدخول بنجاح',
      user: userData
    });
  } catch (error) {
    console.error('Login error:', error);
    return c.json({ success: false, message: 'حدث خطأ في تسجيل الدخول' });
  }
});

app.get('/search-users', async (c) => {
  try {
    const query = c.req.query('q');
    const currentUserId = c.req.header('X-User-ID');
    
    if (!query || !currentUserId) {
      return c.json({ success: false, message: 'معطى البحث مطلوب' });
    }
    
    // Initialize DB
    await initDB(c.env.DB);
    
    // Search users by user_id or email
    const users = await c.env.DB.prepare(
      `SELECT id, user_id, email FROM users 
       WHERE (user_id LIKE ? OR email LIKE ?) AND id != ?
       LIMIT 10`
    ).bind(`%${query}%`, `%${query}%`, currentUserId).all();
    
    return c.json({ 
      success: true, 
      users: users.results 
    });
  } catch (error) {
    console.error('Search users error:', error);
    return c.json({ success: false, message: 'حدث خطأ في البحث' });
  }
});

app.get('/conversations', async (c) => {
  try {
    const currentUserId = c.req.header('X-User-ID');
    
    if (!currentUserId) {
      return c.json({ success: false, message: 'معرف المستخدم مطلوب' });
    }
    
    // Initialize DB
    await initDB(c.env.DB);
    
    // Get conversations with last message
    const conversations = await c.env.DB.prepare(
      `SELECT DISTINCT
        CASE 
          WHEN m.sender_id = ? THEN m.receiver_id 
          ELSE m.sender_id 
        END as other_user_id,
        u.email as other_user_email,
        u.user_id as other_user_uid,
        MAX(m.created_at) as last_message_time
       FROM messages m
       JOIN users u ON u.id = (
         CASE 
           WHEN m.sender_id = ? THEN m.receiver_id 
           ELSE m.sender_id 
         END
       )
       WHERE m.sender_id = ? OR m.receiver_id = ?
       GROUP BY other_user_id, other_user_email, other_user_uid
       ORDER BY last_message_time DESC`
    ).bind(currentUserId, currentUserId, currentUserId, currentUserId).all();
    
    return c.json({ 
      success: true, 
      conversations: conversations.results 
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    return c.json({ success: false, message: 'حدث خطأ في جلب المحادثات' });
  }
});

app.get('/messages', async (c) => {
  try {
    const currentUserId = c.req.header('X-User-ID');
    const otherUserId = c.req.query('other_user_id');
    
    if (!currentUserId || !otherUserId) {
      return c.json({ success: false, message: 'معرف المستخدم مطلوب' });
    }
    
    // Initialize DB
    await initDB(c.env.DB);
    
    // Get messages between two users
    const messages = await c.env.DB.prepare(
      `SELECT m.*, u1.email as sender_email, u2.email as receiver_email
       FROM messages m
       JOIN users u1 ON u1.id = m.sender_id
       JOIN users u2 ON u2.id = m.receiver_id
       WHERE (m.sender_id = ? AND m.receiver_id = ?) 
          OR (m.sender_id = ? AND m.receiver_id = ?)
       ORDER BY m.created_at ASC`
    ).bind(currentUserId, otherUserId, otherUserId, currentUserId).all();
    
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
    const { receiver_id, content } = await c.req.json();
    const sender_id = c.req.header('X-User-ID');
    
    if (!sender_id || !receiver_id || !content) {
      return c.json({ success: false, message: 'جميع البيانات مطلوبة' });
    }
    
    if (content.trim().length === 0) {
      return c.json({ success: false, message: 'محتوى الرسالة لا يمكن أن يكون فارغاً' });
    }
    
    // Initialize DB
    await initDB(c.env.DB);
    
    // Check if receiver exists
    const receiver = await c.env.DB.prepare(
      'SELECT id FROM users WHERE id = ?'
    ).bind(receiver_id).first();
    
    if (!receiver) {
      return c.json({ success: false, message: 'المستخدم المطلوب إرسال الرسالة إليه غير موجود' });
    }
    
    // Insert message
    await c.env.DB.prepare(
      'INSERT INTO messages (sender_id, receiver_id, content) VALUES (?, ?, ?)'
    ).bind(sender_id, receiver_id, content.trim()).run();
    
    return c.json({ 
      success: true, 
      message: 'تم إرسال الرسالة بنجاح' 
    });
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
      'SELECT id, user_id, email, created_at FROM users ORDER BY created_at DESC'
    ).all();
    
    return c.json({ success: true, users: users.results });
  } catch (error) {
    console.error('Get users error:', error);
    return c.json({ success: false, message: 'حدث خطأ في جلب المستخدمين' });
  }
});

export default app;