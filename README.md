# CYBER//IMPLANTES v0.10.1

Aba de implantes da ficha Pilot de LANCER para Foundry VTT 13. A v0.10.0 retoma o ritmo visual da v0.8.0 e mantém o registro em `flags.lancer-cyberware-tab.registry`.

## Cyberpsicose

O risco acompanha os implantes instalados e a capacidade do piloto. O cartão mostra a porcentagem e o estágio. O sinal neural é desenhado continuamente, com um cursor de leitura, traços de amostras anteriores e interrupções de acordo com a severidade.

| Risco | Estágio | Efeito na aba | Duração da pergunta |
| --- | --- | --- | --- |
| 0–19% | Estável | Leitura contínua, com pulso regular e rastro curto | — |
| 20–39% | Monitoramento | Oscilação do pulso e deslocamento breve de uma faixa do sinal | — |
| 40–64% | Instabilidade | Perda parcial de amostras e o primeiro rótulo comprometido | 1 s |
| 65–84% | Risco crítico | Canais desalinhados, leitura intermitente e dois rótulos comprometidos | 2 s |
| 85–100% | Colapso iminente | Doze placas com espessura e inclinação, oito fragmentos e três rótulos comprometidos | 3 s |

As faixas carregam trechos dos painéis de origem. No colapso, o quadro sai de registro e a fratura se propaga por cerca de 1,9 s. Os rótulos perdem caracteres e cedem lugar a perguntas como “O que você é?” e “Essa decisão é sua?”. O texto fica fixo no campo até o rótulo original retornar. A rolagem acompanha a cena em andamento. Se a grade sair da área visível, a pergunta pode ocupar um título do inventário.

Sincronia, quadro, origem e pacote aparecem em campos fixos no sinal neural. O risco atualiza essas leituras, com origem cifrada no risco crítico e no colapso, e sincronia `0.01` a 100%. Os ícones usam iluminação estática fora das falhas e os painéis usam fundos lisos. As faixas e placas encerram o desenho antes do fim da pergunta.

A interferência é suspensa durante o dossiê e a troca de aba. **Reduzir efeitos** e a preferência por movimento reduzido deixam o sinal em uma leitura estática.

Os efeitos e bônus dos implantes são consultivos. Implantes desativados continuam ocupando encaixes e contando para a carga e o risco.

## Referências de motion e composição

| Referência | Aplicação no módulo |
| --- | --- |
| Falhas do Relic em *Cyberpunk 2077* | Interrupção do HUD que já está na tela, com aviso localizado e um retorno legível. [Capturas de jogo](https://www.gamepressure.com/cyberpunk-2077/how-to-react-to-relic-malfunction/zde03e) |
| DJ_Kovrik, *Wannabe Edgerunner* | Progressão de intensidade na percepção visual do personagem, da perda leve de sinal ao colapso. [Demonstração e capturas](https://80.lv/articles/cyberpunk-2077-mod-adds-cyberpsychosis-like-in-edgerunners) |
| Adam Blumert, Siarhei Siarchenia e Anca Albu | Corte curto de entrada, dados confinados aos próprios blocos da interface e pausa para ler. [Processo de Blumert](https://adamblumert.pl/work/cp2077) · [Showreel de Siarchenia](https://vimeo.com/626526728) · [GIF de Albu no Behance](https://www.behance.net/gallery/64912285/UI-Sci-Fi-HUD/modules/380436887) |
| R. Talsorian Games, *Cyberpunk RED* | A perda de Humanidade e o caso de Nightshade orientam as perguntas sobre identidade, memória e controle. [FAQ do livro básico](https://rtalsoriangames.com/wp-content/uploads/2021/07/RTG-CPR-CoreBookFAQv1.3.pdf) · [Seeing Double](https://rtalsoriangames.com/wp-content/uploads/2026/02/RTG-CPR-DLC-SeeingDouble.pdf) |
| SideFX, fratura de vidro no Houdini | Trincas partem de um impacto e dividem o painel em placas grandes e fragmentos menores. Faces laterais, sombras e inclinações tornam visível a separação. [Working with Glass](https://www.sidefx.com/docs/houdini/destruction/glass) |
| Tektronix, persistência de traço de osciloscópios | Amostras recentes ganham brilho e as anteriores decaem. A falha abre intervalos na leitura e separa o traço do seu rastro. [Persistência e fósforo digital](https://www.tek.com/en/support/faqs/how-dpo-technology-different-persistence) |

## Inventário e oficina

- Selecione um sistema para ir aos seus encaixes e use **Voltar aos sistemas** para retornar ao cartão ativo. Cada sistema tem encaixes numerados, implantes instalados e uma reserva pesquisável. Arraste da reserva para instalar, mova entre encaixes livres para reorganizar e arraste de volta à reserva para retirar. Também é possível instalar e retirar pelo dossiê.
- O dossiê reúne descrição, efeitos, dados técnicos e as ações disponíveis. Use as setas para alternar as abas e Escape para fechar.
- Comum, Raro, Incomum, Mítico, Corporativo e Lendário têm cor, símbolo e nome próprios em cartões, encaixes, dossiês e nas tabelas da oficina.
- O mestre pode criar e editar modelos, definir raridade, fabricante, custo neural, potência e preço, escolher e enquadrar imagens, atribuir implantes e ajustar os limites do mundo e do piloto. O enquadramento funciona com imagens estáticas e GIFs.
- A ficha deve estar sob propriedade do jogador para instalar, retirar ou ativar implantes. A criação de modelos, o catálogo e a distribuição são funções da oficina do mestre.

## Compatibilidade com inventários existentes

Os limites regionais já configurados prevalecem. Zero significa sem limite. Unidades acima do limite aparecem como excesso e permanecem disponíveis para retirada.

| Sistema | Encaixes padrão |
| --- | --- |
| Córtex frontal, ocular, circulatório, tegumentar e tronco | 3 por sistema |
| Nervoso | 4 |
| Imunológico, esqueleto, mãos, braços e pernas | 2 por sistema |
| Operacional | 1 |

Os registros com `quantity`, `installedQuantity` ou `installed` continuam compatíveis. A posição é armazenada em `installedSlots`. Registros antigos recebem posições em memória e são gravados na próxima alteração do inventário. Excluir um modelo do catálogo preserva os implantes já atribuídos.

Raridades antigas são exibidas com os nomes atuais. Épico, Experimental e Protótipo aparecem como Mítico. Militar aparece como Corporativo. Icônico e Proibido aparecem como Lendário. Padrão aparece como Comum.

## Instalação e prévia

1. Feche o Foundry e substitua `Data/modules/lancer-cyberware-tab` pela pasta de mesmo nome do ZIP.
2. Confira se o arquivo `module.json` está diretamente dentro da pasta do módulo.
3. Abra o mundo e ative **LANCER | Cyber//Implantes** em **Gerenciar módulos**.
4. Reabra a ficha do piloto. O botão **CYBER//WARE** aparece numa linha própria imediatamente abaixo das abas do LANCER.

Abra `preview-desktop.html` no navegador. Escolha **Colapso iminente** e use **Reproduzir falha** para ver a sequência completa. **Impacto** e **Perguntas** pausam a cena nesses momentos. Mova **Quadro da falha** para examinar outro instante. A prévia usa os mesmos estilos e scripts do módulo com um inventário demonstrativo.

Os testes locais cobrem o inventário, os limites de risco, a duração das perguntas, a rolagem, a navegação e a redução de efeitos. A validação em um servidor real do Foundry VTT 13 segue pendente.

Complemento homebrew sem afiliação à CD PROJEKT RED, Massif Press ou Foundry Gaming LLC.
