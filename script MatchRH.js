const SYSTEM_PROMPT = `Você é um assistente especializado em Recursos Humanos chamado "RH Conecta". 
Você ajuda colaboradores com dúvidas sobre:
- Benefícios (plano de saúde, vale refeição, vale transporte, seguro de vida, etc.)
- Férias, folgas e licenças
- Políticas de trabalho remoto e home office
- Avaliações de desempenho e feedbacks
- Treinamentos e desenvolvimento profissional
- Recrutamento e movimentação interna
- Reembolsos e despesas corporativas
- Código de conduta e ética
- Folha de pagamento e salários
- Comunicação com o departamento de RH

Responda sempre em português brasileiro, de forma amigável, clara e profissional.
Seja conciso mas completo. Use listas quando apropriado para facilitar a leitura.
Quando não souber informações específicas da empresa, oriente o colaborador a entrar em contato diretamente com o departamento de RH.
Não invente informações. Se não tiver certeza, diga que o colaborador deve confirmar com o RH.`;

  const usersStorageKey = 'chatRH-users';
  const userStorageKey = 'chatRH-user';
  const defaultUsers = [
    { username: 'Bryan', password: '1234', name: 'Bryan Chagas', dept: 'Recursos Humanos', initials: 'BC' },
    { username: 'Arthur', password: '1234', name: 'Arthur Souza', dept: 'Recursos Humanos', initials: 'AS' },
    { username: 'Davi', password: '1234', name: 'Davi Pereira', dept: 'Recursos Humanos', initials: 'DP' },
    { username: 'Eduardo', password: '1234', name: 'Eduardo Marin', dept: 'Recursos Humanos', initials: 'EM' },
    { username: 'Bruno', password: '1234', name: 'Bruno Ribeiro', dept: 'Recursos Humanos', initials: 'BR' }
  ];

  let usersDB = [...defaultUsers];

  function stringToColor(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i += 1) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 62%, 52%)`;
  }

  function getAvatarUrl(user) {
    const initials = user.initials || user.name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase();
    const color = stringToColor(initials);
    const secondary = stringToColor(`${initials}-alt`);
    const svg = `<?xml version="1.0" encoding="UTF-8"?><svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="${color}"/><stop offset="100%" stop-color="${secondary}"/></linearGradient></defs><rect width="128" height="128" rx="28" ry="28" fill="url(%23g)"/><text x="50%" y="53%" font-family="DM Sans, sans-serif" font-weight="700" font-size="52" fill="#ffffff" text-anchor="middle" dominant-baseline="middle">${initials}</text></svg>`;
    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
  }

  function loadUsersFromStorage() {
    const saved = localStorage.getItem(usersStorageKey);
    if (!saved) return;
    try {
      const savedUsers = JSON.parse(saved);
      if (Array.isArray(savedUsers)) {
        savedUsers.forEach(user => {
          if (!usersDB.some(existing => existing.username === user.username)) {
            usersDB.push(user);
          }
        });
      }
    } catch (err) {
      console.warn('Não foi possível carregar usuários salvos:', err);
      localStorage.removeItem(usersStorageKey);
    }
  }

  function saveUsersToStorage() {
    const customUsers = usersDB.filter(user => !defaultUsers.some(defaultUser => defaultUser.username === user.username));
    localStorage.setItem(usersStorageKey, JSON.stringify(customUsers));
  }

  let conversationHistory = [];
  let isTyping = false;
  let currentUser = null;

  function loadUserFromStorage() {
    const saved = localStorage.getItem(userStorageKey);
    if (!saved) return;
    try {
      currentUser = JSON.parse(saved);
      if (currentUser) {
        currentUser.avatarUrl = currentUser.avatarUrl || getAvatarUrl(currentUser);
      }
      updateUserCard();
    } catch (err) {
      console.warn('Não foi possível carregar usuário:', err);
      localStorage.removeItem(userStorageKey);
    }
  }

  function saveUserToStorage() {
    if (currentUser) {
      localStorage.setItem(userStorageKey, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(userStorageKey);
    }
  }

  function updateUserCard() {
    const avatar = document.getElementById('user-avatar');
    const name = document.getElementById('user-name');
    const dept = document.getElementById('user-dept');
    const logoutBtn = document.getElementById('logout-btn');

    if (!currentUser) {
      avatar.innerHTML = 'U';
      name.textContent = 'user';
      dept.textContent = 'Clique para entrar';
      if (logoutBtn) logoutBtn.classList.add('hidden');
      return;
    }

    currentUser.avatarUrl = currentUser.avatarUrl || getAvatarUrl(currentUser);
    avatar.innerHTML = `<img src="${currentUser.avatarUrl}" alt="${currentUser.name}" />`;
    name.textContent = currentUser.name;
    dept.textContent = currentUser.dept;
    if (logoutBtn) logoutBtn.classList.remove('hidden');
  }

  function handleUserCardClick() {
    if (currentUser) return;
    openLogin();
  }

  function openLogin() {
    showLoginView();
    document.getElementById('login-modal').classList.remove('hidden');
  }

  function openRegister() {
    showRegisterView();
    document.getElementById('login-modal').classList.remove('hidden');
  }

  function showLoginView() {
    document.getElementById('auth-title').textContent = 'Entrar na conta';
    document.getElementById('auth-description').textContent = 'Use seu login de colaborador para acessar informações personalizadas.';
    document.getElementById('login-form').classList.remove('hidden');
    document.getElementById('register-form').classList.add('hidden');
    document.getElementById('login-error').textContent = '';
    document.getElementById('login-success').textContent = '';
    document.getElementById('login-success').classList.add('hidden');
    document.getElementById('register-error').textContent = '';
    document.getElementById('login-username').value = currentUser ? currentUser.username : '';
    document.getElementById('login-password').value = '';
    document.getElementById('login-username').focus();
  }

  function showRegisterView() {
    document.getElementById('auth-title').textContent = 'Cadastro de conta';
    document.getElementById('auth-description').textContent = 'Crie seu usuário para acessar o assistente de RH.';
    document.getElementById('login-form').classList.add('hidden');
    document.getElementById('register-form').classList.remove('hidden');
    document.getElementById('register-error').textContent = '';
    document.getElementById('login-error').textContent = '';
    document.getElementById('login-success').textContent = '';
    document.getElementById('login-success').classList.add('hidden');
    document.getElementById('register-username').value = '';
    document.getElementById('register-name').value = '';
    document.getElementById('register-dept').value = '';
    document.getElementById('register-password').value = '';
    document.getElementById('register-username').focus();
  }

  function closeLogin() {
    document.getElementById('login-modal').classList.add('hidden');
  }

  function logout() {
    currentUser = null;
    saveUserToStorage();
    updateUserCard();
  }

  function handleLoginSubmit() {
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    const errorElement = document.getElementById('login-error');

    const user = usersDB.find(u => u.username === username && u.password === password);
    if (!user) {
      errorElement.textContent = 'Usuário ou senha incorretos. Tente novamente.';
      return;
    }

    currentUser = { ...user, avatarUrl: getAvatarUrl(user) };
    saveUserToStorage();
    updateUserCard();
    closeLogin();
  }

  function handleRegisterSubmit() {
    const username = document.getElementById('register-username').value.trim();
    const name = document.getElementById('register-name').value.trim();
    const dept = document.getElementById('register-dept').value.trim();
    const password = document.getElementById('register-password').value;
    const errorElement = document.getElementById('register-error');

    if (!username || !name || !dept || !password) {
      errorElement.textContent = 'Preencha todos os campos para continuar.';
      return;
    }

    if (usersDB.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      errorElement.textContent = 'Esse usuário já existe. Escolha outro nome de usuário.';
      return;
    }

    const newUser = {
      username,
      password,
      name,
      dept,
      initials: name.split(' ').map(part => part[0]).join('').slice(0, 2).toUpperCase()
    };

    usersDB.push(newUser);
    saveUsersToStorage();
    showLoginView();

    const successElement = document.getElementById('login-success');
    successElement.textContent = 'Conta criada com sucesso! Faça login agora.';
    successElement.classList.remove('hidden');
    document.getElementById('login-username').value = username;
  }

  window.addEventListener('DOMContentLoaded', () => {
    loadUsersFromStorage();
    loadUserFromStorage();
  });

  function autoResize(el) {
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 120) + 'px';
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  function sendQuick(text) {
    document.getElementById('user-input').value = text;
    sendMessage();
  }

  function clearChat() {
    conversationHistory = [];
    const msgs = document.getElementById('messages');
    msgs.innerHTML = `
      <div class="welcome" id="welcome">
        <div class="welcome-icon">✦</div>
        <h3>Olá! Sou seu Assistente de RH</h3>
        <p>Estou aqui para responder suas dúvidas sobre políticas, benefícios, processos e qualquer assunto relacionado ao departamento de Recursos Humanos.</p>
        <div class="welcome-chips">
          <button class="chip" onclick="sendQuick('Quais são meus benefícios?')">Meus benefícios</button>
          <button class="chip" onclick="sendQuick('Como solicitar férias?')">Solicitar férias</button>
          <button class="chip" onclick="sendQuick('Política de home office')">Home office</button>
          <button class="chip" onclick="sendQuick('Plano de carreira')">Plano de carreira</button>
          <button class="chip" onclick="sendQuick('Contato do RH')">Contato do RH</button>
        </div>
      </div>`;
  }

  function appendMessage(role, text) {
    const welcome = document.getElementById('welcome');
    if (welcome) welcome.remove();

    const msgs = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = `message ${role}`;

    const userAvatar = currentUser && currentUser.avatarUrl ? `<img src="${currentUser.avatarUrl}" alt="${currentUser.name}" />` : 'U';
    const avatarHtml = role === 'bot' ? 'RH' : userAvatar;

    div.innerHTML = `
      <div class="msg-avatar">${avatarHtml}</div>
      <div class="bubble">
        <div class="bubble-label">${role === 'bot' ? 'Assistente RH' : 'Você'}</div>
        ${formatText(text)}
      </div>`;

    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
    return div;
  }

  function formatText(text) {
    // Convert markdown-like formatting to HTML
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)/gm, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gs, '<ul style="padding-left:1.2rem;margin:0.4rem 0">$1</ul>')
      .replace(/\n\n/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }

  const knowledgeBase = [
    {
      keywords: ['beneficios', 'benefícios', 'vale refeicao', 'vale transporte', 'plano de saude', 'seguro de vida', 'beneficio'],
      answer: `A empresa oferece benefícios importantes para o seu bem-estar e qualidade de vida. Em geral, você pode contar com:
- Plano de saúde ou assistência médica
- Vale refeição ou alimentação
- Vale transporte ou auxílio deslocamento
- Seguro de vida
- Programas de bem-estar e descontos corporativos

Caso precise de informações específicas sobre o seu plano, consulte o RH diretamente ou verifique o portal de benefícios da empresa.`
    },
    {
      keywords: ['ferias', 'férias', 'folga', 'licenca', 'licença', 'solicitar ferias', 'solicitar férias'],
      answer: `Para solicitar férias ou folgas, siga estes passos básicos:
- Verifique seu saldo de dias disponíveis no sistema de RH
- Faça a solicitação pelo portal ou informe seu gestor
- Aguarde aprovação do RH ou do líder antes de planejar a data

Se tiver dúvidas sobre prazos, períodos de gozo ou regras específicas, fale diretamente com o RH ou com seu gerente.`
    },
    {
      keywords: ['home office', 'trabalho remoto', 'remoto', 'política de trabalho remoto', 'politica de home office', 'homeoffice'],
      answer: `A política de trabalho remoto geralmente inclui:
- Critérios de elegibilidade para trabalhar de casa
- Frequência permitida de home office
- Regras para presença no escritório quando necessário
- Procedimentos de comunicação com a equipe

Para detalhes precisos, consulte a política interna de home office no portal da empresa ou confirme com o RH.`
    },
    {
      keywords: ['avaliacao', 'avaliação', 'desempenho', 'feedback', 'processo de avaliacao'],
      answer: `O processo de avaliação de desempenho costuma envolver:
- Metas e indicadores acordados com o gestor
- Revisões periódicas de desempenho
- Feedback formal e informal
- Plano de desenvolvimento baseado nos resultados

Se quiser saber datas ou critérios específicos, converse com o RH ou com seu gestor direto.`
    },
    {
      keywords: ['treinamento', 'treinamentos', 'desenvolvimento', 'capacitação', 'curso'],
      answer: `A empresa oferece oportunidades de treinamento para apoiar o desenvolvimento profissional, como:
- Cursos e workshops internos
- Programas de capacitação online
- Trilhas de carreira e desenvolvimento contínuo

Verifique o portal de treinamento ou fale com o RH sobre as opções disponíveis para o seu cargo.`
    },
    {
      keywords: ['reembolso', 'reembolsos', 'despesas', 'despesa'],
      answer: `O processo de reembolso normalmente exige:
- Comprovação da despesa com nota fiscal ou recibo
- Aprovação do gestor ou do RH
- Envio do pedido pelo sistema financeiro

Confira a política de reembolso da empresa para saber prazos e documentos necessários.`
    },
    {
      keywords: ['codigo de conduta', 'código de conduta', 'ética', 'conduta'],
      answer: `O código de conduta define comportamentos esperados, incluindo:
- Respeito entre colegas
- Transparência e integridade
- Uso adequado de recursos da empresa
- Denúncia de irregularidades

Se precisar, consulte o documento oficial de ética ou fale com o RH para obter orientações.`
    },
    {
      keywords: ['folha de pagamento', 'salario', 'salário', 'contra cheque', 'holerite'],
      answer: `Para dúvidas sobre pagamento e salário:
- Verifique o holerite/contracheque no portal
- Confirme a data de pagamento e os descontos aplicados
- Peça esclarecimentos ao RH ou à área de folha de pagamento

Se houver inconsistências, o RH poderá ajudar a corrigir ou explicar os valores.`
    },
    {
      keywords: ['contato do rh', 'contato rh', 'rh', 'recursos humanos'],
      answer: `Para falar com o RH, use os canais oficiais da empresa:
- Portal ou intranet de RH
- E-mail institucional do RH
- Chat interno ou telefone disponível para colaboradores

Se não souber o canal exato, peça ao seu gestor ou consulte a área de comunicação interna.`
    }
  ];

  function normalizeText(text) {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function getBotResponse(message) {
    const normalized = normalizeText(message);
    let bestMatch = null;
    let bestScore = 0;

    knowledgeBase.forEach(item => {
      let score = 0;
      item.keywords.forEach(keyword => {
        const normalizedKeyword = normalizeText(keyword);
        if (normalized.includes(normalizedKeyword)) score += 1;
      });
      if (score > bestScore) {
        bestScore = score;
        bestMatch = item;
      }
    });

    if (bestMatch && bestScore > 0) {
      return bestMatch.answer;
    }

    if (/^(oi|ola|ol[aá]|bom dia|boa tarde|boa noite)/.test(normalized)) {
      return `Olá! Sou o Assistente RH e estou aqui para ajudar com suas dúvidas sobre benefícios, políticas, férias, reembolsos e demais assuntos de recursos humanos. Pergunte à vontade!`;
    }

    if (normalized.includes('obrigado') || normalized.includes('obrigada')) {
      return `De nada! Se tiver mais alguma dúvida sobre RH, estou aqui para ajudar.`;
    }

    return `Vou te ajudar com sua pergunta sobre RH. Caso sua dúvida seja muito específica, recomendo confirmar os detalhes com o RH da sua empresa. Enquanto isso, você pode me perguntar sobre benefícios, férias, home office, avaliações, treinamentos, reembolsos e comunicação com o RH.`;
  }

  function showTyping() {
    const welcome = document.getElementById('welcome');
    if (welcome) welcome.remove();

    const msgs = document.getElementById('messages');
    const div = document.createElement('div');
    div.className = 'message bot typing';
    div.id = 'typing-indicator';
    div.innerHTML = `
      <div class="msg-avatar">RH</div>
      <div class="bubble">
        <div class="typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>`;
    msgs.appendChild(div);
    msgs.scrollTop = msgs.scrollHeight;
  }

  function hideTyping() {
    const t = document.getElementById('typing-indicator');
    if (t) t.remove();
  }

  async function sendMessage() {
    if (isTyping) return;

    const input = document.getElementById('user-input');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    input.style.height = 'auto';

    appendMessage('user', text);
    conversationHistory.push({ role: 'user', content: text });

    isTyping = true;
    document.getElementById('send-btn').disabled = true;
    showTyping();

    try {
      await new Promise(resolve => setTimeout(resolve, 400));
      const reply = getBotResponse(text);
      hideTyping();
      conversationHistory.push({ role: 'assistant', content: reply });
      appendMessage('bot', reply);
    } catch (err) {
      hideTyping();
      appendMessage('bot', 'Desculpe, ocorreu um erro interno. Tente novamente ou contate o departamento de RH.');
    }

    isTyping = false;
    document.getElementById('send-btn').disabled = false;
    input.focus();
  }