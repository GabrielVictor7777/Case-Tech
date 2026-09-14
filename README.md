# Case Tech — site funcional

## O que é
Este projeto não é apenas um HTML estático. Ele usa Node.js + Express e possui:
- catálogo carregado por API;
- painel `/admin` para cadastrar/editar/excluir produtos;
- upload real de fotos;
- preços e especificações editáveis;
- filtros funcionando;
- todos os botões de WhatsApp gerados pelo número configurado;
- logo e imagens servidas localmente, evitando o problema de caminho quebrado;
- layout responsivo;
- fotos dos produtos padronizadas no mesmo palco visual (`object-fit: contain`).

## Rodar
1. Instale Node.js 18+.
2. Abra um terminal nesta pasta.
3. Rode:
   `npm install`
4. Defina as variáveis:
   - `ADMIN_PASSWORD` = senha do painel
   - `WHATSAPP_NUMBER` = DDD + número, sem +, espaços ou símbolos.
5. Rode:
   `npm start`
6. Abra:
   `http://localhost:3000`
7. Painel:
   `http://localhost:3000/admin`

## Fotos
A logo já está em `public/images/casetech-logo.png`.
A foto real do iPhone 13 Pro Max já está em `public/images/iphone-13-pro-max-128gb.png`.

Os outros produtos começam sem foto propositalmente: não inventei fotos dos modelos. Entre no `/admin`, escolha o produto e use "Enviar foto". A foto será armazenada no servidor e aparecerá automaticamente no site.

## Produção
Para publicar, use um servidor Node com armazenamento persistente (por exemplo, VPS/Render/Railway com disco persistente). O arquivo `data/products.json` é a base de dados simples desta versão.
Para uma operação maior, o próximo passo é migrar essa mesma API para PostgreSQL/Supabase.
