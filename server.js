const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json());

// --- CONFIGURAÇÃO SEGURA ---
// Tenta pegar a chave do painel do Render. Se não achar, usa string vazia.
const API_KEY = process.env.API_KEY || ''; 

// Atualizado para o novo Host de "No Watermark"
// (Você pode também usar apenas 'process.env.API_HOST' se já configurou no Render)
const API_HOST = process.env.API_HOST || 'tiktok-video-no-watermark2.p.rapidapi.com'; 

app.get('/api/status', (req, res) => {
    res.json({ status: 'Online' });
});

app.post('/api/download', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL é obrigatória' });
    }

    try {
        // Verificação de segurança para garantir que a chave foi configurada no Render
        if (!API_KEY) {
            return res.status(500).json({ error: 'API Key não configurada no Render' });
        }

        // --- CÓDIGO ATUALIZADO PARA MÉTODO POST ---
        const options = {
            method: 'POST', 
            url: `https://${API_HOST}/`, // URL raiz
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded', // Cabeçalho obrigatório para POST
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': API_HOST
            },
            // Envio da URL via Query String (comum nessa API)
            params: { 
                url: url 
            }
        };

        const response = await axios.request(options);
        
        // --- TRATAMENTO DE RESPOSTA ROBUSTO ---
        // Algumas APIs retornam os dados em response.data.data, outras direto em response.data
        // Isso garante que você achará o link do vídeo independente do formato.
        const dataObj = response.data.data || response.data;

        res.json({
            success: true,
            videoUrl: dataObj.play || dataObj.video || dataObj.wmplay, // Tenta pegar o link sem marca d'água
            cover: dataObj.cover || dataObj.origin_cover,
            title: dataObj.title || "Vídeo baixado",
            author: dataObj.author?.nickname || dataObj.author || "Usuário"
        });

    } catch (error) {
        console.error('Erro na API:', error.response ? error.response.data : error.message);
        res.status(500).json({ error: 'Erro ao processar vídeo. Verifique a URL.' });
    }
});

// --- PORTA DINÂMICA ---
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));
