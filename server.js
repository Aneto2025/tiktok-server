const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors()); 
app.use(express.json());

// --- ALTERAÇÃO 1: SEGURANÇA ---
// Tenta pegar a chave do painel do Render. Se não achar (rodando local), usa a string vazia.
const API_KEY = process.env.API_KEY || ''; 
const API_HOST = 'tiktok-downloader-download-tiktok-videos-without-watermark.p.rapidapi.com'; 
// *Certifique-se que esse host está correto conforme o playground que você me mostrou.*

app.get('/api/status', (req, res) => {
    res.json({ status: 'Online' });
});

app.post('/api/download', async (req, res) => {
    const { url } = req.body;

    if (!url) {
        return res.status(400).json({ error: 'URL é obrigatória' });
    }

    try {
        // Se estiver rodando local e não tiver chave no .env, para aqui.
        if (!API_KEY && process.env.NODE_ENV !== 'production') {
             return res.status(500).json({ error: 'API Key não configurada no Render' });
        }

        const options = {
            method: 'GET',
            url: `https://${API_HOST}/vid/index`, 
            params: { url: url },
            headers: {
                'X-RapidAPI-Key': API_KEY,
                'X-RapidAPI-Host': API_HOST
            }
        };

        const response = await axios.request(options);
        
        // Retorna os dados para o seu front-end
        res.json({
            success: true,
            videoUrl: response.data.video || response.data.play, 
            cover: response.data.cover || response.data.origin_cover,
            title: response.data.title || "Vídeo baixado",
            author: response.data.author?.nickname || "Usuário"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erro ao processar vídeo.' });
    }
});

// --- ALTERAÇÃO 2: PORTA DINÂMICA ---
// O Render manda a porta pela variável de ambiente PORT.
const PORT = process.env.PORT || 3000; 
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));