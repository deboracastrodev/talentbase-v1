Inspiração do novo modelo de negocio

Referencia de startup com modelo de negocio que vamos aplicar https://www.tryrefer.com/

Analise docs/planejamento/analise-competitiva-tryrefer.md

Recrutamento e seleção, com foco em fazer o match de vagas de vendas para o setor de tecnologia. O fluxo de trabalho docs/fluxo-trabalho.

Sobre o sistema
Landing Page - Home

Em ddocs/site/landingpage.pdf landing-page (home) do site, aqui temos a mesma versão em imagens docs/site/modelo-imagem

Essa base deve ser usada para inspirar o design system, em conjunto com docs/layouts, onde tem inspirações da pagina da empresa micro1, que tem um fluxo visual que nos interessa.


em modeldocs/site/modelo-legado-imagem, tem o mesmo conteudo do modelo-legado.pdf, porém em imagem.

docs/site/modelo-legado-imagem/logo-talentbase.png tem a logo, temos que criar a versão do simbolo em svg

Para o design system, vamos criar um esquema assim:
 
atenção: mudando nossas cores de acordo com o que foi definido a landing page e a inspiração de layout.

para criar nosso esquema de cores, um exemplo de como criar https://design.vert-capital.com/color.html

nossa icografia, vamos criar algo nosso, exemplo de como criar: https://design.vert-capital.com/iconography.html

design tokens: https://design.vert-capital.com/design-tokens.html

componentes: https://design.vert-capital.com/component.html 

grid: https://design.vert-capital.com/grid.html

boas praticas: https://design.vert-capital.com/practices.html

espaçamentos: https://design.vert-capital.com/spacing.html


Base de dados e objetivos

Hoje temos uma base de dados sendo alimentada via notion, temos os modelos em csv aqui docs/basedados, nessa pasta também tem docs/basedados/cadastro-empresa-ploomes.md que é um registro de cadastro de empresa. Aqui o conteudo de um cadatsro de vaga docs/basedados/vaga-cadastrada.md

Aqui tem o perfil do candidato compartilhavel docs/layouts/perfil-candidato.png, criado a partir dos dados do notion
Aqui tem a vaga compartilhavel docs/layouts/vaga-disponivel-detalhe.png

Como queremos que esse perfil seja exibido, tem detalhes na landingpage e também referencia docs/layouts/perfil-candidato-referencia

Aqui referencia da nossa tela de buscas docs/layouts/tela-buscar-card-candidato-actions.png, ao clicar em um candidato docs/layouts/tela-buscar-card-on-click.png. Esse modelo também pode se aplciar para busca de vagas de emprego.

Objetivo principal imediato:

Todo sistema deve ser arquitetado com boas praticas e design partnes.

Para nomenclaturas use sempre o ingles

Usaremos api rest e precisamos manter os padroes de api design pensando no front

Criar o design system antes da aplicação

Ter a landinpage conforme planejado

Ter o cadastro que é feito via notion por sistema.

Ter 3 areas, admin, candidato e empresa

Ter um perfil do candidato compartilhavel, como usamos hoje no notion docs/layouts/perfil-candidato.png, como queremos docs/layouts/perfil-candidato-referencia

Ter vaga com link compartilhavel como usamos hoje docs/layouts/vaga-disponivel-detalhe.png, para redesign se inspirar no nosso design system.

Precisamos conseguir colocar status nos candidatos: disponiveis, inativo, sem contrato

Precisamos conseguir classificar os candidatos em rankins - melhores por departamento, top 10, etc. Pois faremos os matchs com as empresas, futuramente isso será automatizado então precisamos criar os recursos de dados para conseguir ter uma visão de qual candidato é melhor por vaga e ir adquirindo insights

Isso é nosso MVP com urgencia critica, depois vamos otimizar. Cuidado com over engenheir

Precisamos configurar o deploy no github actions e aws, já temos o aws cli configurado na maquina e endereço de dns salesdog.click, haviamos configurado um ambiente antes, mas vamos migrar completamente para esse repositorio.





