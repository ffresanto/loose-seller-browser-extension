# Preenchedor Fiscal Shopee

Extensão local para Chrome/Edge que preenche os campos fiscais da segunda etapa do cadastro de produto.

## Instalação

1. Abra `chrome://extensions` no Chrome ou `edge://extensions` no Edge.
2. Ative **Modo do desenvolvedor**.
3. Clique em **Carregar sem compactação**.
4. Selecione esta pasta inteira: `shopee-preenchedor`.
5. Abra o Seller Center, entre no cadastro de produto e avance para a segunda etapa.
6. Clique no ícone de extensões e abra **Preenchedor Fiscal Shopee**.
7. Edite os valores desejados e clique em **Salvar valores**.
8. Na segunda etapa do cadastro, clique em **Preencher**.

## Observações

- A extensão não faz login, não envia o formulário e não publica o produto.
- Ela preenche somente os campos fiscais configurados no arquivo `content-shopee.js`.
- Os valores alterados na extensão são salvos no armazenamento local do navegador e permanecem após fechar e abrir o Chrome/Edge.
- Se a Shopee alterar o layout ou os identificadores dos campos, será necessário atualizar a extensão.
- Os valores fiscais devem ser confirmados com o contador responsável pela empresa.
