(window.webpackJsonp=window.webpackJsonp||[]).push([[6],{141:function(e,t,n){"use strict";n.r(t),n.d(t,"frontMatter",(function(){return r})),n.d(t,"metadata",(function(){return s})),n.d(t,"rightToc",(function(){return c})),n.d(t,"default",(function(){return b}));var o=n(2),i=n(9),a=(n(0),n(153)),r={id:"install",title:"Installation Guide",sidebar_label:"Install"},s={id:"install",title:"Installation Guide",description:"Installation",source:"@site/docs/INSTALL.md",permalink:"/beacon-bot/docs/install",editUrl:"https://github.com/facebook/docusaurus/edit/master/website/docs/INSTALL.md",sidebar_label:"Install",sidebar:"someSidebar",next:{title:"Docker",permalink:"/beacon-bot/docs/docker"}},c=[{value:"Requirements",id:"requirements",children:[{value:"Javascript Tools",id:"javascript-tools",children:[]},{value:"Project Dependencies",id:"project-dependencies",children:[]}]},{value:"Discord Configuration",id:"discord-configuration",children:[]},{value:"Running the bot",id:"running-the-bot",children:[]}],l={rightToc:c};function b(e){var t=e.components,n=Object(i.a)(e,["components"]);return Object(a.b)("wrapper",Object(o.a)({},l,n,{components:t,mdxType:"MDXLayout"}),Object(a.b)("h1",{id:"installation"},"Installation"),Object(a.b)("h2",{id:"requirements"},"Requirements"),Object(a.b)("ul",null,Object(a.b)("li",{parentName:"ul"},"Make sure you have node 13+ installed ",Object(a.b)("inlineCode",{parentName:"li"},"https://nodejs.org/en/download/package-manager/")),Object(a.b)("li",{parentName:"ul"},"You will need a MySQL database. The code has been tested with version 5.7 but likely any modern version should be fine. ")),Object(a.b)("h3",{id:"javascript-tools"},"Javascript Tools"),Object(a.b)("p",null,"  Yarn or NPM is required.  "),Object(a.b)("p",null,"  To install yarn please see this ",Object(a.b)("a",Object(o.a)({parentName:"p"},{href:"https://classic.yarnpkg.com/en/docs/install"}),"guide")," or type the command below."),Object(a.b)("pre",null,Object(a.b)("code",Object(o.a)({parentName:"pre"},{className:"language-sh"}),"curl -o- -L https://yarnpkg.com/install.sh | bash\n")),Object(a.b)("h3",{id:"project-dependencies"},"Project Dependencies"),Object(a.b)("p",null,"  install the package dependencies.  In the project's root folder run one of the following commands:"),Object(a.b)("pre",null,Object(a.b)("code",Object(o.a)({parentName:"pre"},{}),"npm install\n")),Object(a.b)("p",null,"  or"),Object(a.b)("pre",null,Object(a.b)("code",Object(o.a)({parentName:"pre"},{className:"language-sh"}),"yarn install\n")),Object(a.b)("h1",{id:"configuring-the-bot"},"Configuring the Bot"),Object(a.b)("p",null,"make a copy of config-example.js and update the configuration accordingly.  Optionally you may copy env-template to .env and you can use it\nto override any settings.  As long as the settings being printed when the bot starts look correct either pattern is valid."),Object(a.b)("h2",{id:"discord-configuration"},"Discord Configuration"),Object(a.b)("p",null,"Follow the Doscord documentation linked below for instructions on getting a token and setting up your Bot on your server."),Object(a.b)("p",null,Object(a.b)("a",Object(o.a)({parentName:"p"},{href:"https://discordjs.guide/preparations/setting-up-a-bot-application.html#your-token"}),"Setting up a bot application")),Object(a.b)("p",null,Object(a.b)("a",Object(o.a)({parentName:"p"},{href:"https://discordjs.guide/preparations/adding-your-bot-to-servers.html"}),"Adding your bot to servers")),Object(a.b)("p",null,"We recommend the following minimum permissions for security but you can also just assign the Administrator role if you would like. "),Object(a.b)("p",null,Object(a.b)("img",Object(o.a)({parentName:"p"},{src:"/static/img/discord_permissions.png",alt:"Discord Permissions"}))),Object(a.b)("h2",{id:"running-the-bot"},"Running the bot"),Object(a.b)("pre",null,Object(a.b)("code",Object(o.a)({parentName:"pre"},{}),"node index.js\n")))}b.isMDXComponent=!0}}]);