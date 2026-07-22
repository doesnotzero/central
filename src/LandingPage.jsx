import React, { useState, useEffect, useRef, useCallback } from "react";

const SALES_WHATSAPP = "5548998050267";
const INSTAGRAM_URL = "https://instagram.com/doesnotzero";
const INSTAGRAM_DEV_URL = "https://instagram.com/doesnotzerodev";
const LOGO_SRC = "/dnz-assets/dnz-films-logo-transparent.webp";

const LANG_STORAGE_KEY = "dnz_lang";

// ---------------------------------------------------------------------------
// i18n dictionary — flat "section.key" strings for pt (default) and en.
// ---------------------------------------------------------------------------
const translations = {
  pt: {
    "nav.trabalhos": "Trabalhos",
    "nav.lutas": "Lutas",
    "nav.galeria": "Galeria",
    "nav.cases": "Cases",
    "nav.sobre": "Sobre",
    "nav.pacotes": "Pacotes",
    "nav.login": "Login",
    "nav.cta": "Começar →",
    "nav.logoAria": "DNZ Films — início",
    "nav.langAria": "Mudar idioma para inglês",

    "hero.tag": "Florianópolis, BR — Does Not Zero",
    "hero.descStrong": "Surf. Atletas. Lutadores. Marcas em movimento.",
    "hero.descText": "Produção audiovisual com direção, captação e edição — feita pra quem não para.",
    "hero.ctaStart": "Começar projeto →",
    "hero.ctaPortfolio": "Ver portfólio ↓",
    "hero.showreelAria": "Assistir showreel DNZ Films",
    "hero.showreelAlt": "Showreel DNZ Films",
    "hero.reelLabel": "Showreel",
    "hero.reelTitle": "ASSISTA AO TRABALHO.",

    "ticker.items": ["SURF", "DOES NOT ZERO", "ATLETAS", "LUTADORES", "MOTION NEVER STOPS", "SHAPERS", "MARCAS", "DNZ FILMS", "FLORIANÓPOLIS"],

    "problem.label": "O problema",
    "problem.title1": "O MOMENTO",
    "problem.title2": "FOI FORTE.",
    "problem.title3dim": "O VÍDEO",
    "problem.title4": "NÃO FOI.",
    "problem.p1": "Você treinou meses pra uma luta de 3 rounds. Pegou a sessão da vida no dia certo. Uma prancha que levou semanas pra shape. Uma marca que representa algo de verdade.",
    "problem.p2": "<strong>E o vídeo que sobrou não chega perto do que foi viver aquilo.</strong>",
    "problem.p3": "Câmera tremida. Corte no meio da ação. Áudio ruim, ritmo errado, música que não bate com a cena. O momento foi brutal — o vídeo ficou morno.",
    "problem.p4": "A DNZ existe pra isso não acontecer de novo: direção no set, corte com intenção, cor e som fechando a cena. <strong>Pra quem assiste sentir o impacto que você sentiu.</strong>",
    "problem.link": "Ver como trabalhamos ↓",

    "solucao.cards": [
      { n: "01", icon: "🌊", name: "SURF", text: "Sessões, atletas, shapers e fábricas de prancha. <strong>Cinema na água.</strong> Do drop ao shape, a gente registra com a mesma entrega de quem tá na linha do pico." },
      { n: "02", icon: "🥊", name: "LUTADORES", text: "Do treino ao octógono. <strong>Camps, pesagens, corner e a luta.</strong> Material que mostra a rotina, a preparação e a explosão — pra sponsor, pra rede e pra história." },
      { n: "03", icon: "🏃", name: "ATLETAS", text: "Jornadas humanas que merecem ser contadas. <strong>Material pra sponsor. Documentário de temporada.</strong> Conteúdo que mostra o que você fez antes de dizer." },
      { n: "04", icon: "◎", name: "MARCAS", text: "Marcas em movimento que representam algo de verdade. <strong>Não propaganda. Narrativa.</strong> Vídeo que faz o cliente entender o valor antes do preço." }
    ],

    "eventos.label": "Cobertura de evento",
    "eventos.title1": "ENERGIA AO",
    "eventos.title2": "VIVO.",
    "eventos.p1": "Show, luta, festa, lançamento ou ativação de marca — a DNZ captura a <strong>energia do ao vivo</strong> e devolve em formato vertical, pronto pra postar enquanto o hype ainda tá quente.",
    "eventos.p2": "Do público ao palco, do backstage ao aftermovie: imagem com ritmo, cor e intenção. Não é só registrar o evento — é fazer quem não estava lá <strong>sentir que perdeu algo.</strong>",
    "eventos.list1": "Reels e stories 9:16 pra Instagram e TikTok",
    "eventos.list2": "Aftermovie e cortes rápidos já no dia seguinte",
    "eventos.list3": "Cobertura de palco, público, bastidores e ação",
    "eventos.list4": "Entrega no timing das redes, sem esfriar",
    "eventos.btn": "Pedir cobertura →",
    "eventos.videoAria": "Assistir vídeo Social Impact — cobertura de festa",
    "eventos.videoAlt": "Social Impact — cobertura de festa",
    "eventos.phoneCap": "SOCIAL IMPACT · REELS",

    "trabalhos.label": "Portfólio",
    "trabalhos.title1": "TRABALHOS",
    "trabalhos.title2": "SELECIONADOS.",
    "trabalhos.watchAria": "Assistir {title}",

    "lutas.label": "Lutas · Feed",
    "lutas.title1": "DO TREINO",
    "lutas.title2": "AO COMBATE.",
    "lutas.sub": "Role e assista. Cada vídeo dá play sozinho — toque no som pra ativar o áudio. Sem sair da página.",
    "lutas.pause": "Pausar",
    "lutas.play": "Reproduzir",
    "lutas.soundOn": "Desativar som",
    "lutas.soundOff": "Ativar som",

    "galeria.label": "Galeria · Luta",
    "galeria.title1": "FRAMES DE",
    "galeria.title2": "COMBATE.",
    "galeria.sub": "Stills capturados no calor da luta — o instante antes, o impacto e o que fica depois. Clique pra ampliar e navegue frame a frame.",
    "galeria.altPrefix": "Still de combate — DNZ Films",
    "galeria.expandAria": "Ampliar imagem {i} de {total}",
    "galeria.closeAria": "Fechar galeria",
    "galeria.prevAria": "Imagem anterior",
    "galeria.nextAria": "Próxima imagem",
    "galeria.dialogAria": "Galeria de imagens",

    "cases.label": "Cases reais",
    "cases.title1": "PROVA",
    "cases.title2": "REAL.",
    "cases.c1type": "Documentário · Gabriel Duran · Triatleta Extremo",
    "cases.c1quote": "\"Gostei muito da forma como você registrou a La Mission. Não só pela imagem, mas pela sensibilidade. Dá pra sentir alma no que você faz.\"",
    "cases.c1cite": "— Gabriel Duran, Triatleta Extremo & Ultrarunner",
    "cases.c1lbl": "Does Not Zero",
    "cases.c2type": "Johnny · Shaper · Fábrica de pranchas · Florianópolis",
    "cases.c2quote": "\"Sem reajustes. Sem nada. Ficou animal. Animal demais. Parabéns, irmão.\"",
    "cases.c2cite": "— Johnny, JP Surfboards",
    "cases.c2lbl": "Sem reajustes",
    "cases.c2aria": "Assistir JP Surfboards",
    "cases.c3name": "SEU PROJETO",
    "cases.c3type": "Em aberto · Surf / Atleta / Marca",
    "cases.c3quote": "A câmera não para. Seu projeto pode ser o próximo.",
    "cases.c3btn": "Começar →",

    "sobre.label": "Direção",
    "sobre.title1": "QUEM ESTÁ",
    "sobre.title2": "POR TRÁS.",
    "sobre.p1": "<strong>Gabriel d. Pimentel</strong> — diretor, editor e fundador da DNZ Films, em Florianópolis. Começou filmando o que vive: surf, esporte e gente em movimento. <strong>Does Not Zero</strong> não é só um nome — é o compromisso de que nada sai da mesa sem intenção, ritmo e alma em cada frame.",
    "sobre.p2": "Da line-up ao octógono, da fábrica de pranchas à marca que quer narrativa de verdade: a DNZ une <strong>olhar cinematográfico</strong> com a agilidade de quem vive o audiovisual na prática.",
    "sobre.p3": "Aqui não se terceiriza o cuidado. <strong>Quem dirige é quem edita, quem entrega é quem se importa</strong> — do primeiro corte à cor final.",
    "sobre.cap1t": "Direção",
    "sobre.cap1d": "Conceito, ritmo e narrativa visual",
    "sobre.cap2t": "Captação",
    "sobre.cap2d": "Surf, luta, esporte, lifestyle e marca",
    "sobre.cap3t": "Pós",
    "sobre.cap3d": "Edição, cor, som e cortes pra cada formato",
    "sobre.photoAlt": "Gabriel d. Pimentel — diretor da DNZ Films",

    "pacotes.label": "Pacotes",
    "pacotes.title1": "ESCOLHA",
    "pacotes.title2": "SEU FORMATO.",
    "pacotes.note": "Três formatos, sem complicação. Não sabe qual escolher? O briefing em 4 passos te ajuda a definir.",
    "pacotes.loop.n": "01 / MENSAL",
    "pacotes.loop.tag": "Sua marca postando sempre — sem quebrar a cabeça",
    "pacotes.loop.list1": "4 vídeos/mês (reels 9:16, cortes ou teaser)",
    "pacotes.loop.list2": "Pauta e ideias pensadas junto com você",
    "pacotes.loop.list3": "Color grading assinatura DNZ + sound design",
    "pacotes.loop.list4": "Legendas e captions prontos pra postar",
    "pacotes.loop.list5": "Trilha licenciada — sem dor de cabeça com direitos",
    "pacotes.loop.list6": "Até 7 dias por vídeo · 1 revisão cada",
    "pacotes.loop.list7": "Calendário de postagem sugerido",
    "pacotes.loop.list8": "Ideal pra: atletas, lutadores, surfistas e shapers",
    "pacotes.loop.btn": "Quero o LOOP →",
    "pacotes.motion.n": "02 / PROJETO",
    "pacotes.motion.tag": "Um filme que vira sua vitrine + cortes pra girar",
    "pacotes.motion.list1": "1 filme principal (até 3 min) com direção e roteiro",
    "pacotes.motion.list2": "3 cortes verticais pra redes sociais",
    "pacotes.motion.list3": "Captação em campo (treino, luta, sessão, evento)",
    "pacotes.motion.list4": "Filmagem + edição completa",
    "pacotes.motion.list5": "Color grading cinematográfico + sound design",
    "pacotes.motion.list6": "Até 15 dias · 2 revisões inclusas",
    "pacotes.motion.list7": "Arquivos prontos pra site, pitch e redes",
    "pacotes.motion.list8": "Ideal pra: marcas, atletas, lutadores e lançamentos",
    "pacotes.motion.btn": "Quero o MOTION →",
    "pacotes.zero.n": "03 / PREMIUM",
    "pacotes.zero.tag": "Quando o projeto pede cinema de verdade",
    "pacotes.zero.list1": "Escopo desenhado do zero, junto com você",
    "pacotes.zero.list2": "Documentário de temporada, campanha ou série",
    "pacotes.zero.list3": "Direção criativa + roteiro + pré-produção",
    "pacotes.zero.list4": "Captação multi-dia e múltiplas locações",
    "pacotes.zero.list5": "Múltiplos vídeos e formatos (16:9, 9:16, 1:1)",
    "pacotes.zero.list6": "Color grading e sound design premium",
    "pacotes.zero.list7": "Acompanhamento próximo do início à entrega",
    "pacotes.zero.list8": "Ideal pra: projetos grandes, marcas e atletas premium",
    "pacotes.zero.btn": "Falar sobre ZERO →",

    "processo.label": "Como funciona",
    "processo.title1": "4 PASSOS.",
    "processo.title2": "SEM ENROLAÇÃO.",
    "processo.steps": [
      { bg: "01", icon: "💬", t: "BRIEFING", d: "Responde 4 perguntas rápidas aqui embaixo. Entendo o projeto, o prazo e o objetivo do vídeo — sem reunião só pra marcar reunião." },
      { bg: "02", icon: "📋", t: "PROPOSTA", d: "Em até 24h volta uma proposta clara: escopo, prazo e valor na mesa. Sem letra miúda, sem surpresa depois." },
      { bg: "03", icon: "🎬", t: "PRODUÇÃO", d: "Você filma ou a gente filma junto. O material entra em edição — corte, cor, som e ritmo. Cada frame com propósito." },
      { bg: "04", icon: "✅", t: "ENTREGA", d: "Vídeo pronto no prazo combinado, com revisão inclusa. Sai daqui pronto pra postar, apresentar ou publicar." }
    ],

    "form.label": "Briefing",
    "form.title1": "4 PERGUNTAS.",
    "form.title2": "PROPOSTA EM 24H.",
    "form.intro": "Sem call desnecessária, sem formulário chato. Responde 4 perguntas rápidas e sua mensagem cai organizada direto no WhatsApp da DNZ — a proposta personalizada volta em até 24h.",
    "form.step1.question": "Qual é o seu <em>projeto?</em>",
    "form.step1.hint": "ESCOLHA A OPÇÃO QUE MAIS SE ENCAIXA",
    "form.step1.options": [
      ["Sessão de surf / edição", "Sessão de surf — edição cinematográfica"],
      ["Conteúdo mensal para redes", "Conteúdo mensal para redes sociais"],
      ["Projeto de atleta / documentário", "Projeto de atleta — documentário ou sponsor"],
      ["Shaper / fábrica de prancha", "Shaper ou fábrica — processo e bastidores"],
      ["Vídeo para marca / negócio", "Vídeo para marca ou negócio"],
      ["Cobertura de evento", "Cobertura de evento ou ativação"],
      ["Reel ou vídeo único", "Reel ou vídeo único para redes"],
      ["Campanha / lançamento", "Campanha ou lançamento de produto"],
      ["Documentário", "Documentário ou projeto longo"],
      ["Outro projeto", "Outro — explico melhor no WhatsApp"]
    ],
    "form.step2.question": "O que você <em>precisa?</em>",
    "form.step2.hint": "SERVIÇO E FORMATO DE INTERESSE",
    "form.step2.options": [
      ["Só edição — já tenho material", "Só edição — já tenho material filmado"],
      ["Só filmagem", "Só filmagem / captação"],
      ["Filmagem + edição completa", "Filmagem + edição completa"],
      ["Direção criativa + produção", "Direção criativa + produção"],
      ["Ainda não sei — preciso de orientação", "Ainda não sei — preciso de orientação"]
    ],
    "form.step2.hint2": "PACOTE DE INTERESSE (OPCIONAL)",
    "form.step2.options2": [
      ["LOOP — conteúdo mensal", "LOOP — conteúdo mensal"],
      ["MOTION — projeto fechado", "MOTION — projeto fechado"],
      ["ZERO — sob medida", "ZERO — produção sob medida"],
      ["Ainda não sei o formato", "Ainda não sei o formato"]
    ],
    "form.step3.question": "Qual é o seu <em>prazo?</em>",
    "form.step3.hint": "QUANDO VOCÊ PRECISA DO VÍDEO",
    "form.step3.options": [
      ["Urgente (menos de 1 semana)", "Urgente — menos de 1 semana"],
      ["Próximas 2 semanas", "Próximas 2 semanas"],
      ["Este mês", "Este mês"],
      ["1 a 2 meses", "De 1 a 2 meses"],
      ["Sem prazo definido", "Sem prazo — quero planejar com calma"]
    ],
    "form.step4.question": "Seu <em>contato.</em>",
    "form.step4.hint": "A GENTE RESPONDE EM ATÉ 24H",
    "form.step4.nameLabel": "Seu nome",
    "form.step4.namePlaceholder": "Como você se chama?",
    "form.step4.wppLabel": "WhatsApp",
    "form.step4.wppPlaceholder": "(48) 99999-9999",
    "form.step4.igLabel": "Instagram (opcional)",
    "form.step4.igPlaceholder": "@seuinstagram",
    "form.step4.msgLabel": "Contexto extra (opcional)",
    "form.step4.msgPlaceholder": "Marca, referência, local, onde o vídeo vai ser publicado...",
    "form.next": "Próximo →",
    "form.back": "← Voltar",
    "form.submit": "Enviar via WhatsApp →",
    "form.success.title": "PRONTO.",
    "form.success.text": "Sua mensagem foi montada com suas respostas.<br />Se o WhatsApp não abriu, use o botão abaixo.",
    "form.success.btn": "Abrir WhatsApp",

    "cta.over": "Pronto pra não parar?",
    "cta.title": "MOTION<br />NEVER<br />STOPS.",
    "cta.btnStart": "Começar projeto →",
    "cta.btnInstagram": "@doesnotzero no Instagram",

    "footer.tag": "DOES NOT ZERO — FLORIANÓPOLIS, BR",
    "footer.blurb": "Produção audiovisual pra surf, luta, atletas e marcas em movimento. Direção, captação e edição — feito por quem vive o movimento.",
    "footer.trabalhos": "Trabalhos",
    "footer.lutas": "Lutas",
    "footer.galeria": "Galeria",
    "footer.eventos": "Eventos",
    "footer.cases": "Cases",
    "footer.sobre": "Sobre",
    "footer.pacotes": "Pacotes",
    "footer.briefing": "Briefing",
    "footer.login": "Login",
    "footer.copyPrefix": "©",
    "footer.copySuffix": "DNZ Films — Does Not Zero. Todos os direitos reservados.",
    "footer.creditPrefix": "Site desenvolvido por ",
    "footer.logoAria": "DNZ Films",
    "footer.langLabel": "Idioma",

    "float.wppAria": "Falar no WhatsApp",
    "float.wppTip": "WHATSAPP",
    "float.igAria": "Instagram @doesnotzero",
    "float.igTip": "@DOESNOTZERO",
    "float.wppMsg": "Olá, DNZ! Vim pelo site e quero saber mais sobre um projeto.",

    "lightbox.fallbackTitle": "Vídeo DNZ Films",
    "lightbox.fallbackCategory": "Portfólio",
    "lightbox.showreelTitle": "Showreel DNZ Films",
    "lightbox.showreelCategory": "Portfólio",
    "lightbox.socialImpactTitle": "Social Impact",
    "lightbox.socialImpactCategory": "Cobertura de evento · Reels 9:16",
    "lightbox.closeAria": "Fechar vídeo",
    "lightbox.dialogAria": "Player de vídeo",

    "categories.Esporte": "Esporte",
    "categories.Surf film": "Surf film",
    "categories.Marca · Shaper": "Marca · Shaper",
    "categories.Luta · Atleta": "Luta · Atleta",
    "fightTitles.Combate 01": "Combate 01",
    "fightTitles.Combate 02": "Combate 02",
    "fightTitles.Combate 03": "Combate 03",

    "wpp.header": "🎬 *NOVO BRIEFING — DNZ FILMS*",
    "wpp.greeting": "Olá, DNZ! Me chamo *{nome}* e vim pelo site pedir um orçamento.",
    "wpp.projectHeader": "*— O PROJETO —*",
    "wpp.type": "📌 Tipo:",
    "wpp.service": "🎥 Serviço:",
    "wpp.format": "📦 Formato:",
    "wpp.deadline": "⏱️ Prazo:",
    "wpp.contactHeader": "*— CONTATO —*",
    "wpp.whatsapp": "📱 WhatsApp:",
    "wpp.instagram": "📷 Instagram:",
    "wpp.contextHeader": "*— CONTEXTO —*",
    "wpp.contextLabel": "📝",
    "wpp.closing": "Podemos conversar sobre os próximos passos? 🤝",

    "login.status.loading": "Verificando",
    "login.status.connected": "Conta conectada",
    "login.status.private": "Acesso privado",
    "login.kicker": "DNZ FILMS",
    "login.title": "Area reservada.",
    "login.desc": "Acesso interno para revisar clientes, propostas, projetos, documentos, financeiro e Video Review da Does Not Zero. Entre apenas com a conta autorizada.",
    "login.deniedTitle": "Conta sem permissao",
    "login.deniedText": "{email} nao esta liberada para este workspace.",
    "login.deniedFallback": "Esta conta",
    "login.allowedTitle": "Acesso liberado",
    "login.openWorkspace": "Abrir workspace",
    "login.logout": "Sair desta conta",
    "login.enter": "Entrar",
    "login.backHome": "Voltar para o site",
    "login.checkingSession": "Verificando sessao...",
    "login.brand": "Does Not Zero / DNZ Films",
    "login.logoAria": "Voltar para Does Not Zero"
  },
  en: {
    "nav.trabalhos": "Work",
    "nav.lutas": "Fights",
    "nav.galeria": "Gallery",
    "nav.cases": "Cases",
    "nav.sobre": "About",
    "nav.pacotes": "Packages",
    "nav.login": "Login",
    "nav.cta": "Get started →",
    "nav.logoAria": "DNZ Films — home",
    "nav.langAria": "Switch language to Portuguese",

    "hero.tag": "Florianópolis, Brazil — Does Not Zero",
    "hero.descStrong": "Surfers. Athletes. Fighters. Brands in motion.",
    "hero.descText": "Film production with direction, footage and edit — made for those who never stop.",
    "hero.ctaStart": "Start your project →",
    "hero.ctaPortfolio": "See our work ↓",
    "hero.showreelAria": "Watch the DNZ Films showreel",
    "hero.showreelAlt": "DNZ Films showreel",
    "hero.reelLabel": "Showreel",
    "hero.reelTitle": "WATCH THE WORK.",

    "ticker.items": ["SURF", "DOES NOT ZERO", "ATHLETES", "FIGHTERS", "MOTION NEVER STOPS", "SHAPERS", "BRANDS", "DNZ FILMS", "FLORIANÓPOLIS"],

    "problem.label": "The problem",
    "problem.title1": "THE MOMENT",
    "problem.title2": "WAS STRONG.",
    "problem.title3dim": "THE VIDEO",
    "problem.title4": "WASN'T.",
    "problem.p1": "You trained for months for a 3 round fight. You caught the session of a lifetime on the right day. A board that took weeks to shape. A brand that stands for something real.",
    "problem.p2": "<strong>And the video that came out of it doesn't come close to what it felt like living it.</strong>",
    "problem.p3": "Shaky camera. Cuts in the middle of the action. Bad audio, wrong pacing, music that doesn't match the scene. The moment was brutal — the video fell flat.",
    "problem.p4": "DNZ exists so that doesn't happen again: direction on set, editing with intention, color and sound locking the scene in. <strong>So whoever's watching feels the impact you felt.</strong>",
    "problem.link": "See how we work ↓",

    "solucao.cards": [
      { n: "01", icon: "🌊", name: "SURF", text: "Sessions, athletes, shapers and surfboard factories. <strong>Cinema in the water.</strong> From the drop to the shape, we deliver with the same commitment as those on the peak." },
      { n: "02", icon: "🥊", name: "FIGHTERS", text: "From training to the octagon. <strong>Camps, weigh-ins, corner work and the fight.</strong> Footage that shows the routine, the prep and the explosion — for sponsors, socials and the story." },
      { n: "03", icon: "🏃", name: "ATHLETES", text: "Human journeys that deserve to be told. <strong>Sponsor reels. Season documentaries.</strong> Content that shows what you did before you say it." },
      { n: "04", icon: "◎", name: "BRANDS", text: "Brands in motion that stand for something real. <strong>Not advertising. Storytelling.</strong> Video that gets clients to understand the value before the price." }
    ],

    "eventos.label": "Event coverage",
    "eventos.title1": "LIVE",
    "eventos.title2": "ENERGY.",
    "eventos.p1": "Shows, fights, parties, launches or brand activations — DNZ captures <strong>live energy</strong> and delivers it in vertical format, ready to post while the hype is still hot.",
    "eventos.p2": "From the crowd to the stage, from backstage to the aftermovie: footage with rhythm, color and intention. It's not just documenting the event — it's making the people who weren't there <strong>feel like they missed something.</strong>",
    "eventos.list1": "9:16 reels and stories for Instagram and TikTok",
    "eventos.list2": "Aftermovie and quick cuts by the next day",
    "eventos.list3": "Coverage of stage, crowd, backstage and action",
    "eventos.list4": "Delivered on social media's timing, while it's still hot",
    "eventos.btn": "Request coverage →",
    "eventos.videoAria": "Watch the Social Impact video — party coverage",
    "eventos.videoAlt": "Social Impact — party coverage",
    "eventos.phoneCap": "SOCIAL IMPACT · REELS",

    "trabalhos.label": "Portfolio",
    "trabalhos.title1": "SELECTED",
    "trabalhos.title2": "WORK.",
    "trabalhos.watchAria": "Watch {title}",

    "lutas.label": "Fights · Feed",
    "lutas.title1": "FROM TRAINING",
    "lutas.title2": "TO THE FIGHT.",
    "lutas.sub": "Scroll and watch. Every video plays on its own — tap the sound icon to turn on audio. No need to leave the page.",
    "lutas.pause": "Pause",
    "lutas.play": "Play",
    "lutas.soundOn": "Mute sound",
    "lutas.soundOff": "Unmute sound",

    "galeria.label": "Gallery · Fights",
    "galeria.title1": "FRAMES OF",
    "galeria.title2": "COMBAT.",
    "galeria.sub": "Stills captured in the heat of the fight — the instant before, the impact and what's left after. Click to zoom and browse frame by frame.",
    "galeria.altPrefix": "Fight still — DNZ Films",
    "galeria.expandAria": "Zoom image {i} of {total}",
    "galeria.closeAria": "Close gallery",
    "galeria.prevAria": "Previous image",
    "galeria.nextAria": "Next image",
    "galeria.dialogAria": "Image gallery",

    "cases.label": "Real cases",
    "cases.title1": "PROOF IT",
    "cases.title2": "WORKS.",
    "cases.c1type": "Documentary · Gabriel Duran · Extreme Triathlete",
    "cases.c1quote": "\"I really loved the way you captured La Mission. Not just the visuals, but the sensitivity. You can feel the soul in what you do.\"",
    "cases.c1cite": "— Gabriel Duran, Extreme Triathlete & Ultrarunner",
    "cases.c1lbl": "Does Not Zero",
    "cases.c2type": "Johnny · Shaper · Surfboard factory · Florianópolis",
    "cases.c2quote": "\"No adjustments needed. Nothing. It came out incredible. Way too good. Congrats, brother.\"",
    "cases.c2cite": "— Johnny, JP Surfboards",
    "cases.c2lbl": "Zero revisions needed",
    "cases.c2aria": "Watch JP Surfboards",
    "cases.c3name": "YOUR PROJECT",
    "cases.c3type": "Open slot · Surf / Athlete / Brand",
    "cases.c3quote": "The camera doesn't stop. Your project could be next.",
    "cases.c3btn": "Get started →",

    "sobre.label": "Direction",
    "sobre.title1": "WHO'S BEHIND",
    "sobre.title2": "THE LENS.",
    "sobre.p1": "<strong>Gabriel d. Pimentel</strong> — director, editor and founder of DNZ Films, based in Florianópolis. He started out filming what he lives: surf, sport and people in motion. <strong>Does Not Zero</strong> isn't just a name — it's the commitment that nothing leaves the table without intention, rhythm and soul in every frame.",
    "sobre.p2": "From the lineup to the octagon, from the surfboard factory to the brand that wants real storytelling: DNZ blends a <strong>cinematic eye</strong> with the agility of someone who lives film production in practice.",
    "sobre.p3": "Nothing here gets outsourced. <strong>Whoever directs also edits, whoever delivers actually cares</strong> — from the first cut to the final color.",
    "sobre.cap1t": "Direction",
    "sobre.cap1d": "Concept, pacing and visual storytelling",
    "sobre.cap2t": "Footage",
    "sobre.cap2d": "Surf, fights, sports, lifestyle and brands",
    "sobre.cap3t": "Post",
    "sobre.cap3d": "Editing, color, sound and cuts for every format",
    "sobre.photoAlt": "Gabriel d. Pimentel — director at DNZ Films",

    "pacotes.label": "Packages",
    "pacotes.title1": "CHOOSE",
    "pacotes.title2": "YOUR FORMAT.",
    "pacotes.note": "Three formats, no complications. Not sure which to pick? The 4 step briefing below helps you decide.",
    "pacotes.loop.n": "01 / MONTHLY",
    "pacotes.loop.tag": "Your brand posting consistently — no headaches",
    "pacotes.loop.list1": "4 videos/month (9:16 reels, cutdowns or teasers)",
    "pacotes.loop.list2": "Content ideas planned together with you",
    "pacotes.loop.list3": "DNZ signature color grading + sound design",
    "pacotes.loop.list4": "Captions ready to post",
    "pacotes.loop.list5": "Licensed music — no rights headaches",
    "pacotes.loop.list6": "Up to 7 days per video · 1 revision each",
    "pacotes.loop.list7": "Suggested posting calendar",
    "pacotes.loop.list8": "Great for: athletes, fighters, surfers and shapers",
    "pacotes.loop.btn": "I want LOOP →",
    "pacotes.motion.n": "02 / PROJECT",
    "pacotes.motion.tag": "A film that becomes your showcase + cutdowns to spread it",
    "pacotes.motion.list1": "1 main film (up to 3 min) with direction and script",
    "pacotes.motion.list2": "3 vertical cutdowns for social media",
    "pacotes.motion.list3": "On-location shooting (training, fight, session, event)",
    "pacotes.motion.list4": "Full filming + editing",
    "pacotes.motion.list5": "Cinematic color grading + sound design",
    "pacotes.motion.list6": "Up to 15 days · 2 revisions included",
    "pacotes.motion.list7": "Files ready for your site, pitch decks and socials",
    "pacotes.motion.list8": "Great for: brands, athletes, fighters and launches",
    "pacotes.motion.btn": "I want MOTION →",
    "pacotes.zero.n": "03 / PREMIUM",
    "pacotes.zero.tag": "When the project calls for real cinema",
    "pacotes.zero.list1": "Scope designed from scratch, together with you",
    "pacotes.zero.list2": "Season documentary, campaign or series",
    "pacotes.zero.list3": "Creative direction + script + pre-production",
    "pacotes.zero.list4": "Multi-day shoots across multiple locations",
    "pacotes.zero.list5": "Multiple videos and formats (16:9, 9:16, 1:1)",
    "pacotes.zero.list6": "Premium color grading and sound design",
    "pacotes.zero.list7": "Close support from kickoff to delivery",
    "pacotes.zero.list8": "Great for: large-scale projects, brands and premium athletes",
    "pacotes.zero.btn": "Let's talk ZERO →",

    "processo.label": "How it works",
    "processo.title1": "4 STEPS.",
    "processo.title2": "NO RUNAROUND.",
    "processo.steps": [
      { bg: "01", icon: "💬", t: "BRIEFING", d: "Answer 4 quick questions below. We get the project, the deadline and the goal of the video — no meeting just to schedule a meeting." },
      { bg: "02", icon: "📋", t: "PROPOSAL", d: "Within 24h you get a clear proposal: scope, timeline and price on the table. No fine print, no surprises later." },
      { bg: "03", icon: "🎬", t: "PRODUCTION", d: "You film it, or we film it together. Footage moves into editing — cut, color, sound and pacing. Every frame with purpose." },
      { bg: "04", icon: "✅", t: "DELIVERY", d: "Video delivered on the agreed timeline, with a revision included. Ready to post, present or publish." }
    ],

    "form.label": "Briefing",
    "form.title1": "4 QUESTIONS.",
    "form.title2": "PROPOSAL IN 24H.",
    "form.intro": "No unnecessary calls, no annoying forms. Answer 4 quick questions and your message lands organized straight into DNZ's WhatsApp — your personalized proposal comes back within 24h.",
    "form.step1.question": "What's your <em>project?</em>",
    "form.step1.hint": "PICK THE OPTION THAT FITS BEST",
    "form.step1.options": [
      ["Surf session / edit", "Surf session — cinematic edit"],
      ["Monthly social content", "Monthly content for social media"],
      ["Athlete project / documentary", "Athlete project — documentary or sponsor reel"],
      ["Shaper / surfboard factory", "Shaper or factory — process and behind the scenes"],
      ["Video for a brand / business", "Video for a brand or business"],
      ["Event coverage", "Event coverage or activation"],
      ["Single reel or video", "Single reel or video for social media"],
      ["Campaign / launch", "Product campaign or launch"],
      ["Documentary", "Documentary or long-form project"],
      ["Other project", "Other — I'll explain more on WhatsApp"]
    ],
    "form.step2.question": "What do you <em>need?</em>",
    "form.step2.hint": "SERVICE AND FORMAT OF INTEREST",
    "form.step2.options": [
      ["Editing only — I already have footage", "Editing only — I already have footage"],
      ["Filming only", "Filming / footage only"],
      ["Filming + full editing", "Filming + full editing"],
      ["Creative direction + production", "Creative direction + production"],
      ["Not sure yet — need guidance", "Not sure yet — need guidance"]
    ],
    "form.step2.hint2": "PACKAGE OF INTEREST (OPTIONAL)",
    "form.step2.options2": [
      ["LOOP — monthly content", "LOOP — monthly content"],
      ["MOTION — one-off project", "MOTION — one-off project"],
      ["ZERO — custom made", "ZERO — custom production"],
      ["Not sure about the format yet", "Not sure about the format yet"]
    ],
    "form.step3.question": "What's your <em>deadline?</em>",
    "form.step3.hint": "WHEN YOU NEED THE VIDEO",
    "form.step3.options": [
      ["Urgent (less than 1 week)", "Urgent — less than 1 week"],
      ["Next 2 weeks", "Next 2 weeks"],
      ["This month", "This month"],
      ["1 to 2 months", "1 to 2 months"],
      ["No fixed deadline", "No deadline — I want to plan carefully"]
    ],
    "form.step4.question": "Your <em>contact.</em>",
    "form.step4.hint": "WE REPLY WITHIN 24H",
    "form.step4.nameLabel": "Your name",
    "form.step4.namePlaceholder": "What's your name?",
    "form.step4.wppLabel": "WhatsApp",
    "form.step4.wppPlaceholder": "(48) 99999-9999",
    "form.step4.igLabel": "Instagram (optional)",
    "form.step4.igPlaceholder": "@yourinstagram",
    "form.step4.msgLabel": "Extra context (optional)",
    "form.step4.msgPlaceholder": "Brand, reference, location, where the video will be published...",
    "form.next": "Next →",
    "form.back": "← Back",
    "form.submit": "Send via WhatsApp →",
    "form.success.title": "ALL SET.",
    "form.success.text": "Your message was put together from your answers.<br />If WhatsApp didn't open, use the button below.",
    "form.success.btn": "Open WhatsApp",

    "cta.over": "Ready to never stop?",
    "cta.title": "MOTION<br />NEVER<br />STOPS.",
    "cta.btnStart": "Start your project →",
    "cta.btnInstagram": "@doesnotzero on Instagram",

    "footer.tag": "DOES NOT ZERO — FLORIANÓPOLIS, BRAZIL",
    "footer.blurb": "Film production for surf, fights, athletes and brands in motion. Direction, footage and editing — made by people who live the movement.",
    "footer.trabalhos": "Work",
    "footer.lutas": "Fights",
    "footer.galeria": "Gallery",
    "footer.eventos": "Events",
    "footer.cases": "Cases",
    "footer.sobre": "About",
    "footer.pacotes": "Packages",
    "footer.briefing": "Briefing",
    "footer.login": "Login",
    "footer.copyPrefix": "©",
    "footer.copySuffix": "DNZ Films — Does Not Zero. All rights reserved.",
    "footer.creditPrefix": "Website by ",
    "footer.logoAria": "DNZ Films",
    "footer.langLabel": "Language",

    "float.wppAria": "Chat on WhatsApp",
    "float.wppTip": "WHATSAPP",
    "float.igAria": "Instagram @doesnotzero",
    "float.igTip": "@DOESNOTZERO",
    "float.wppMsg": "Hi DNZ! I found you through the website and want to know more about a project.",

    "lightbox.fallbackTitle": "DNZ Films Video",
    "lightbox.fallbackCategory": "Portfolio",
    "lightbox.showreelTitle": "DNZ Films Showreel",
    "lightbox.showreelCategory": "Portfolio",
    "lightbox.socialImpactTitle": "Social Impact",
    "lightbox.socialImpactCategory": "Event coverage · 9:16 Reels",
    "lightbox.closeAria": "Close video",
    "lightbox.dialogAria": "Video player",

    "categories.Esporte": "Sports",
    "categories.Surf film": "Surf Film",
    "categories.Marca · Shaper": "Brand · Shaper",
    "categories.Luta · Atleta": "Fight · Athlete",
    "fightTitles.Combate 01": "Fight 01",
    "fightTitles.Combate 02": "Fight 02",
    "fightTitles.Combate 03": "Fight 03",

    "wpp.header": "🎬 *NEW BRIEFING — DNZ FILMS*",
    "wpp.greeting": "Hi DNZ! My name is *{nome}* and I came through the website to ask for a quote.",
    "wpp.projectHeader": "*— THE PROJECT —*",
    "wpp.type": "📌 Type:",
    "wpp.service": "🎥 Service:",
    "wpp.format": "📦 Format:",
    "wpp.deadline": "⏱️ Deadline:",
    "wpp.contactHeader": "*— CONTACT —*",
    "wpp.whatsapp": "📱 WhatsApp:",
    "wpp.instagram": "📷 Instagram:",
    "wpp.contextHeader": "*— CONTEXT —*",
    "wpp.contextLabel": "📝",
    "wpp.closing": "Can we talk about next steps? 🤝",

    "login.status.loading": "Checking",
    "login.status.connected": "Account connected",
    "login.status.private": "Private access",
    "login.kicker": "DNZ FILMS",
    "login.title": "Restricted area.",
    "login.desc": "Internal access to review clients, proposals, projects, documents, finances and Video Review at Does Not Zero. Sign in only with an authorized account.",
    "login.deniedTitle": "Account not authorized",
    "login.deniedText": "{email} is not authorized for this workspace.",
    "login.deniedFallback": "This account",
    "login.allowedTitle": "Access granted",
    "login.openWorkspace": "Open workspace",
    "login.logout": "Sign out",
    "login.enter": "Sign in",
    "login.backHome": "Back to the website",
    "login.checkingSession": "Checking session...",
    "login.brand": "Does Not Zero / DNZ Films",
    "login.logoAria": "Back to Does Not Zero"
  }
};

const getInitialLang = () => {
  if (typeof window === "undefined") return "pt";
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (stored === "pt" || stored === "en") return stored;
  } catch (e) { /* localStorage unavailable */ }
  const nav = typeof navigator !== "undefined" ? navigator.language || "" : "";
  return nav.toLowerCase().startsWith("en") ? "en" : "pt";
};

const translate = (lang, key, vars) => {
  const dict = translations[lang] || translations.pt;
  let value = dict[key];
  if (value === undefined) value = translations.pt[key];
  if (value === undefined) return key;
  if (typeof value === "string" && vars) {
    Object.keys(vars).forEach(k => {
      value = value.replace(new RegExp(`\\{${k}\\}`, "g"), vars[k]);
    });
  }
  return value;
};

const portfolioItems = [
  { title: "Black Venom", category: "Esporte", type: "vimeo", vimeoId: "1177779611", thumb: "/dnz-assets/1177779611.webp", featured: true },
  { title: "But Definitely", category: "Surf film", type: "vimeo", vimeoId: "1177775878", thumb: "/dnz-assets/1177775878.webp" },
  { title: "JP Surfboards", category: "Marca · Shaper", type: "vimeo", vimeoId: "1177774829", thumb: "/dnz-assets/1177774829.webp" }
];

const fightItems = [
  { title: "Combate 01", category: "Luta · Atleta", type: "local", src: "/dnz-assets/fight-1.mp4", thumb: "/dnz-assets/fight-1.webp" },
  { title: "Combate 02", category: "Luta · Atleta", type: "local", src: "/dnz-assets/fight-2.mp4", thumb: "/dnz-assets/fight-2.webp" },
  { title: "Combate 03", category: "Luta · Atleta", type: "local", src: "/dnz-assets/fight-3.mp4", thumb: "/dnz-assets/fight-3.webp" }
];

const galleryStills = [
  { src: "/dnz-assets/still-1.webp", alt: "Still de combate — DNZ Films 01" },
  { src: "/dnz-assets/still-2.webp", alt: "Still de combate — DNZ Films 02" },
  { src: "/dnz-assets/still-3.webp", alt: "Still de combate — DNZ Films 03" },
  { src: "/dnz-assets/still-4.webp", alt: "Still de combate — DNZ Films 04" },
  { src: "/dnz-assets/still-5.webp", alt: "Still de combate — DNZ Films 05" },
  { src: "/dnz-assets/still-6.webp", alt: "Still de combate — DNZ Films 06" }
];

const PLAY_SVG = '<svg viewBox="0 0 24 24" fill="white"><path d="M9 6v12l10-6L9 6Z"/></svg>';

const WHATSAPP_SVG_PATH = "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z";

const WhatsAppSvg = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d={WHATSAPP_SVG_PATH} /></svg>
);

const InstagramSvg = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="white" aria-hidden="true"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
);

const SOUND_ON_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg>';
const SOUND_OFF_SVG = '<svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H2v6h4l5 4V5Z"/><path d="m22 9-6 6"/><path d="m16 9 6 6"/></svg>';
const PAUSE_SVG = '<svg viewBox="0 0 24 24" fill="white"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>';

const FeedVideo = ({ item, t }) => {
  const videoRef = useRef(null);
  const [muted, setMuted] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = true;
    const io = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && entry.intersectionRatio >= 0.6) {
          v.play().catch(() => {});
        } else {
          v.pause();
        }
      });
    }, { threshold: [0, 0.6, 1] });
    io.observe(v);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    return () => { v.removeEventListener("play", onPlay); v.removeEventListener("pause", onPause); };
  }, []);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  };

  const toggleMute = e => {
    e.stopPropagation();
    const v = videoRef.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    setMuted(next);
    if (!next && v.paused) v.play().catch(() => {});
  };

  return (
    <div className="reel-item">
      <div
        className={`reel-frame${showControls ? " show" : ""}`}
        onClick={togglePlay}
        onMouseEnter={() => setShowControls(true)}
        onMouseLeave={() => setShowControls(playing ? false : true)}
        role="button"
        tabIndex={0}
        onKeyDown={e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); togglePlay(); } }}
        aria-label={`${playing ? t("lutas.pause") : t("lutas.play")} ${t(`fightTitles.${item.title}`)}`}
      >
        <video
          ref={videoRef}
          src={item.src}
          poster={item.thumb}
          muted={muted}
          loop
          playsInline
          preload="metadata"
        />
        {!playing && <span className="reel-center-play" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PLAY_SVG }} />}
        <button type="button" className="reel-sound" onClick={toggleMute} aria-label={muted ? t("lutas.soundOff") : t("lutas.soundOn")} dangerouslySetInnerHTML={{ __html: muted ? SOUND_OFF_SVG : SOUND_ON_SVG }} />
        <div className="reel-meta">
          <span className="reel-cat">{t(`categories.${item.category}`)}</span>
          <span className="reel-name">{t(`fightTitles.${item.title}`)}</span>
        </div>
      </div>
    </div>
  );
};

const LoginPage = ({ session, isAdmin, cloudStatus, onLogin, onLogout, onHome }) => {
  const [lang] = useState(getInitialLang);
  const t = (key, vars) => translate(lang, key, vars);

  return (
    <main id="main-content" className="dnz-login-page">
      <div className="dnz-login-bg" />
      <section className="dnz-login-card">
        <div className="dnz-login-top">
          <button type="button" className="dnz-login-logo" onClick={onHome} aria-label={t("login.logoAria")}>
            <img src={LOGO_SRC} alt="DNZ Films" />
          </button>
          <span>{cloudStatus === "loading" ? t("login.status.loading") : session?.user ? t("login.status.connected") : t("login.status.private")}</span>
        </div>
        <div className="dnz-login-kicker">{t("login.kicker")}</div>
        <h1>{t("login.title")}</h1>
        <p>{t("login.desc")}</p>
        {session?.user && !isAdmin && (
          <div className="dnz-denied">
            <strong>{t("login.deniedTitle")}</strong>
            <span>{t("login.deniedText", { email: session.user.email || t("login.deniedFallback") })}</span>
          </div>
        )}
        {session?.user && isAdmin && (
          <div className="dnz-allowed">
            <strong>{t("login.allowedTitle")}</strong>
            <span>{session.user.email}</span>
          </div>
        )}
        <div className="dnz-login-actions">
          {session?.user ? (
            <>
              {isAdmin && <a className="dnz-btn-red" href="/app">{t("login.openWorkspace")}</a>}
              <button type="button" className="dnz-btn-ghost" onClick={onLogout}>{t("login.logout")}</button>
            </>
          ) : (
            <button type="button" className="dnz-btn-red" onClick={onLogin}>{t("login.enter")}</button>
          )}
          <button type="button" className="dnz-btn-ghost" onClick={onHome}>{t("login.backHome")}</button>
        </div>
        <div className="dnz-login-meta">
          <span>{cloudStatus === "loading" ? t("login.checkingSession") : t("login.brand")}</span>
        </div>
      </section>
    </main>
  );
};

const LandingPage = ({ onLogin }) => {

  const lastFocusRef = useRef(null);
  const footerRef = useRef(null);

  const [floatHidden, setFloatHidden] = useState(false);

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxVideo, setLightboxVideo] = useState(null);
  const [lightboxLocalSrc, setLightboxLocalSrc] = useState(null);
  const [lightboxVertical, setLightboxVertical] = useState(false);
  const [lightboxMeta, setLightboxMeta] = useState({ title: "", category: "" });

  const [galleryIndex, setGalleryIndex] = useState(null);

  const [step, setStep] = useState(1);
  const [answers, setAnswers] = useState({ project: "", service: "", package: "", deadline: "", nome: "", wpp: "", ig: "", msg: "" });
  const [submitted, setSubmitted] = useState(false);

  const [lang, setLang] = useState(getInitialLang);
  const t = useCallback((key, vars) => translate(lang, key, vars), [lang]);

  useEffect(() => {
    try { window.localStorage.setItem(LANG_STORAGE_KEY, lang); } catch (e) { /* localStorage unavailable */ }
    document.documentElement.lang = lang === "en" ? "en" : "pt-BR";
  }, [lang]);

  const toggleLang = useCallback(() => {
    setLang(prev => (prev === "en" ? "pt" : "en"));
  }, []);

  const videoMap = {};
  portfolioItems.forEach(i => { videoMap[i.vimeoId] = i; });
  videoMap["1177771656"] = { title: t("lightbox.showreelTitle"), category: t("lightbox.showreelCategory") };
  videoMap["1177798436"] = { title: t("lightbox.socialImpactTitle"), category: t("lightbox.socialImpactCategory"), vertical: true };

  const openVideo = useCallback((vimeoId, isVertical = false) => {
    lastFocusRef.current = document.activeElement;
    const meta = videoMap[vimeoId] || { title: t("lightbox.fallbackTitle"), category: t("lightbox.fallbackCategory") };
    setLightboxMeta(meta);
    setLightboxLocalSrc(null);
    setLightboxVideo(vimeoId);
    setLightboxVertical(isVertical);
    setLightboxOpen(true);
  }, [videoMap, t]);

  const openLocal = useCallback((item, isVertical = false) => {
    lastFocusRef.current = document.activeElement;
    setLightboxMeta({ title: item.title || t("lightbox.fallbackTitle"), category: item.category || t("lightbox.fallbackCategory") });
    setLightboxVideo(null);
    setLightboxLocalSrc(item.src);
    setLightboxVertical(isVertical);
    setLightboxOpen(true);
  }, [t]);

  const closeVideo = useCallback(() => {
    setLightboxOpen(false);
    setLightboxVideo(null);
    setLightboxLocalSrc(null);
  }, []);

  const openGallery = useCallback(i => {
    lastFocusRef.current = document.activeElement;
    setGalleryIndex(i);
  }, []);

  const closeGallery = useCallback(() => {
    setGalleryIndex(null);
    const el = lastFocusRef.current;
    if (el && typeof el.focus === "function") el.focus();
  }, []);

  const galleryNav = useCallback(dir => {
    setGalleryIndex(prev => {
      if (prev === null) return prev;
      const n = galleryStills.length;
      return (prev + dir + n) % n;
    });
  }, []);

  useEffect(() => {
    if (!lightboxOpen) return;
    document.body.style.overflow = "hidden";
    const lb = document.getElementById("lightboxClose");
    if (lb) lb.focus();
    return () => { document.body.style.overflow = ""; };
  }, [lightboxOpen, lightboxMeta]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const el = document.getElementById("lightboxVideo");
    if (!el) return;
    if (lightboxLocalSrc) {
      el.innerHTML = `<video src="${lightboxLocalSrc}" controls autoplay playsinline preload="metadata" style="width:100%;height:100%;background:#000"></video>`;
    } else if (lightboxVideo) {
      el.innerHTML = `<iframe src="https://player.vimeo.com/video/${lightboxVideo}?autoplay=1&autopause=0&title=0&byline=0&portrait=0&dnt=1" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen title="${t("lightbox.fallbackTitle")}"></iframe>`;
    } else {
      return;
    }
    return () => { el.innerHTML = ""; };
  }, [lightboxOpen, lightboxVideo, lightboxLocalSrc, t]);

  useEffect(() => {
    const handleKey = e => { if (e.key === "Escape") closeVideo(); };
    if (lightboxOpen) { document.addEventListener("keydown", handleKey); return () => document.removeEventListener("keydown", handleKey); }
  }, [lightboxOpen, closeVideo]);

  useEffect(() => {
    if (galleryIndex === null) return;
    document.body.style.overflow = "hidden";
    const handleKey = e => {
      if (e.key === "Escape") closeGallery();
      else if (e.key === "ArrowRight") galleryNav(1);
      else if (e.key === "ArrowLeft") galleryNav(-1);
    };
    document.addEventListener("keydown", handleKey);
    const btn = document.getElementById("galleryClose");
    if (btn) btn.focus();
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [galleryIndex, closeGallery, galleryNav]);

  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("vis");
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".landing-section.fu, .form-intro.fu").forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    const yr = document.getElementById("year");
    if (yr) yr.textContent = new Date().getFullYear().toString();
  }, []);

  useEffect(() => {
    const el = footerRef.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => setFloatHidden(entry.isIntersecting),
      { threshold: 0.05 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  const scrollTo = (e, id) => {
    e.preventDefault();
    const el = document.querySelector(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const selectOpt = (key, val) => setAnswers(prev => ({ ...prev, [key]: val }));

  const goToStep = n => {
    setStep(n);
    setTimeout(() => {
      const el = document.getElementById("form-section");
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const formatPhone = value => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits ? `(${digits}` : "";
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const checkS4 = answers.nome.length >= 2 && answers.wpp.replace(/\D/g, "").length >= 10;

  const buildWppUrl = () => {
    const lines = [
      t("wpp.header"),
      "",
      t("wpp.greeting", { nome: answers.nome.trim() }),
      "",
      t("wpp.projectHeader"),
      `${t("wpp.type")} ${answers.project}`,
      `${t("wpp.service")} ${answers.service}`
    ];
    if (answers.package) lines.push(`${t("wpp.format")} ${answers.package}`);
    lines.push(`${t("wpp.deadline")} ${answers.deadline}`);
    lines.push("");
    lines.push(t("wpp.contactHeader"));
    lines.push(`${t("wpp.whatsapp")} ${answers.wpp}`);
    if (answers.ig) lines.push(`${t("wpp.instagram")} ${answers.ig}`);
    if (answers.msg) {
      lines.push("");
      lines.push(t("wpp.contextHeader"));
      lines.push(`${t("wpp.contextLabel")} ${answers.msg.trim()}`);
    }
    lines.push("");
    lines.push(t("wpp.closing"));
    const text = lines.join("\n");
    return `https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(text)}`;
  };

  const handleSubmit = () => {
    const url = buildWppUrl();
    window.open(url, "_blank", "noopener,noreferrer");
    setSubmitted(true);
  };

  const preset = (projectVal, pkgVal) => {
    if (projectVal) selectOpt("project", projectVal);
    if (pkgVal) selectOpt("package", pkgVal);
    goToStep(1);
  };

  return (
    <>
      <style>{`
:root {
  --black: #0A0A0A;
  --white: #F2F2F2;
  --red: #FF2400;
  --gray: #141414;
  --gray2: #1E1E1E;
  --gray3: #2A2A2A;
  --muted: #555;
  --D: 'Bebas Neue', sans-serif;
  --M: 'Space Mono', monospace;
  --B: 'DM Sans', sans-serif;
}
.dnz-landing-root *,.dnz-landing-root *::before,.dnz-landing-root *::after{margin:0;padding:0;box-sizing:border-box}
.dnz-landing-root{background:var(--black);color:var(--white);font-family:var(--B);overflow-x:hidden;-webkit-font-smoothing:antialiased}
.dnz-landing-root img,.dnz-landing-root iframe{display:block;max-width:100%}
.dnz-landing-root button{color:inherit;font:inherit}
.dnz-landing-root a:focus-visible,.dnz-landing-root button:focus-visible,.dnz-landing-root .form-opt:focus-visible{outline:2px solid var(--red);outline-offset:3px}
.dnz-landing-root nav{position:fixed;top:0;left:0;right:0;z-index:100;padding:20px 48px;display:flex;align-items:center;justify-content:space-between;background:linear-gradient(to bottom,rgba(10,10,10,.92),rgba(10,10,10,.4),transparent)}
.dnz-landing-root .nav-logo{display:block;text-decoration:none;line-height:0}
.dnz-landing-root .nav-logo img{height:55px;width:auto;display:block;filter:hue-rotate(338deg) saturate(1.35) brightness(1.02)}
.dnz-landing-root .nav-r{display:flex;align-items:center;gap:40px}
.dnz-landing-root .nav-links{display:flex;gap:32px;list-style:none}
.dnz-landing-root .nav-links a,.dnz-landing-root .nav-links button{font-family:var(--M);font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--white);text-decoration:none;opacity:.5;transition:opacity .2s;background:none;border:0;cursor:pointer}
.dnz-landing-root .nav-links a:hover,.dnz-landing-root .nav-links button:hover{opacity:1}
.dnz-landing-root .nav-cta{font-family:var(--M);font-size:10px;letter-spacing:3px;text-transform:uppercase;background:var(--red);color:var(--white);padding:12px 24px;text-decoration:none;transition:opacity .2s}
.dnz-landing-root .nav-cta:hover{opacity:.85}
.dnz-landing-root .nav-login-mobile{display:none}
.dnz-landing-root .lang-toggle{font-family:var(--M);font-size:10px;letter-spacing:3px;text-transform:uppercase;background:none;border:1px solid var(--gray3);color:rgba(242,242,242,.5);padding:8px 12px;cursor:pointer;transition:border-color .2s,color .2s;display:inline-flex;align-items:center;gap:2px}
.dnz-landing-root .lang-toggle:hover{border-color:var(--red);color:var(--white)}
.dnz-landing-root .lang-toggle span{transition:color .2s,opacity .2s;opacity:.55}
.dnz-landing-root .lang-toggle span.on{color:var(--red);opacity:1}
.dnz-landing-root .f-links .lang-toggle{border:1px solid var(--gray3);padding:6px 10px}
.dnz-landing-root #hero{min-height:100vh;display:flex;flex-direction:column;justify-content:flex-end;padding:108px 48px 80px;position:relative;overflow:hidden}
.dnz-landing-root .hero-bg{position:absolute;inset:0;z-index:0;pointer-events:none}
.dnz-landing-root .hero-noise{position:absolute;inset:0;background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='.04'/%3E%3C/svg%3E");opacity:.25}
.dnz-landing-root .hero-grad{position:absolute;inset:0;background:radial-gradient(ellipse at 85% 8%,rgba(255,36,0,.08) 0%,transparent 42%),radial-gradient(ellipse at 10% 90%,rgba(255,36,0,.04) 0%,transparent 48%)}
.dnz-landing-root .hero-lines{position:absolute;inset:0;background-image:linear-gradient(rgba(242,242,242,.02) 1px,transparent 1px),linear-gradient(90deg,rgba(242,242,242,.02) 1px,transparent 1px);background-size:64px 64px;mask-image:linear-gradient(180deg,transparent 0%,#000 18%,#000 62%,transparent 100%);opacity:.55}
.dnz-landing-root .hero-inner{position:relative;z-index:2}
.dnz-landing-root .hero-tag{font-family:var(--M);font-size:10px;letter-spacing:5px;text-transform:uppercase;color:var(--red);margin-bottom:20px;display:flex;align-items:center;gap:12px}
.dnz-landing-root .hero-tag::before{content:'';width:32px;height:1px;background:var(--red)}
.dnz-landing-root .hero-h{font-family:var(--D);font-size:clamp(72px,13vw,190px);line-height:.88;letter-spacing:-1px;margin-bottom:4px}
.dnz-landing-root .hero-h .cross{position:relative;display:inline-block;color:var(--red)}
.dnz-landing-root .hero-h .cross::after{content:'';position:absolute;left:-4px;right:-4px;top:50%;height:4px;background:var(--white);transform:translateY(-50%) rotate(-1.5deg)}
.dnz-landing-root .hero-sub{font-family:var(--D);font-size:clamp(16px,2vw,28px);letter-spacing:12px;color:rgba(242,242,242,.35);margin-bottom:48px}
.dnz-landing-root .hero-bottom{display:flex;align-items:flex-end;justify-content:space-between;gap:40px}
.dnz-landing-root .hero-desc{font-size:14px;line-height:1.9;color:rgba(242,242,242,.45);max-width:360px}
.dnz-landing-root .hero-desc strong{color:var(--white);font-weight:500}
.dnz-landing-root .hero-actions{display:flex;flex-direction:column;align-items:flex-end;gap:12px}
.dnz-landing-root .btn-red{display:inline-flex;align-items:center;gap:14px;background:var(--red);color:var(--white);font-family:var(--M);font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:18px 36px;text-decoration:none;transition:all .25s;position:relative;overflow:hidden;border:none;cursor:pointer}
.dnz-landing-root .btn-red::after{content:'';position:absolute;inset:0;background:rgba(255,255,255,0);transition:background .25s}
.dnz-landing-root .btn-red:hover::after{background:rgba(255,255,255,.08)}
.dnz-landing-root .btn-ghost{font-family:var(--M);font-size:10px;letter-spacing:3px;text-transform:uppercase;color:rgba(242,242,242,.4);text-decoration:none;transition:color .2s;border:none;background:transparent;cursor:pointer}
.dnz-landing-root .btn-ghost:hover{color:var(--white)}
.dnz-landing-root .hero-scroll{position:absolute;left:48px;bottom:0;z-index:1;width:1px;height:80px;background:linear-gradient(transparent,var(--red));animation:dnzPulse 2.5s ease-in-out infinite;pointer-events:none}
@keyframes dnzPulse{0%,100%{opacity:.3}50%{opacity:1}}
.dnz-landing-root .hero-reel{position:relative;z-index:2;margin-top:56px;border:1px solid var(--gray3);overflow:hidden;background:var(--gray)}
.dnz-landing-root .reel-btn{width:100%;min-height:clamp(220px,32vw,420px);display:block;border:0;padding:0;background:var(--black);cursor:pointer;position:relative}
.dnz-landing-root .reel-btn img{width:100%;height:100%;min-height:inherit;object-fit:cover;opacity:.75;filter:saturate(.9) contrast(1.08);transition:opacity .25s,transform .7s}
.dnz-landing-root .reel-btn:hover img{opacity:.88;transform:scale(1.03)}
.dnz-landing-root .reel-overlay{position:absolute;inset:0;display:flex;align-items:flex-end;justify-content:space-between;gap:24px;padding:28px 32px;pointer-events:none;background:linear-gradient(180deg,transparent,rgba(10,10,10,.85))}
.dnz-landing-root .reel-label{font-family:var(--M);font-size:10px;letter-spacing:4px;text-transform:uppercase;color:rgba(242,242,242,.5)}
.dnz-landing-root .reel-title{font-family:var(--D);font-size:clamp(28px,4vw,52px);letter-spacing:3px;line-height:.95;margin-top:6px}
.dnz-landing-root .reel-play{width:64px;height:64px;border:1px solid rgba(242,242,242,.35);border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--white);background:rgba(10,10,10,.5);backdrop-filter:blur(8px);flex-shrink:0;transition:transform .25s,border-color .25s}
.dnz-landing-root .reel-btn:hover .reel-play{transform:scale(1.08);border-color:var(--red)}
.dnz-landing-root .reel-play svg{width:22px;height:22px;margin-left:3px}
.dnz-landing-root #trabalhos{padding:120px 48px}
.dnz-landing-root .work-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px;margin-top:56px}
.dnz-landing-root .work-card{position:relative;aspect-ratio:16/10;overflow:hidden;border:0;padding:0;background:#000;cursor:pointer;text-align:left;transition:transform .35s ease,box-shadow .35s ease}
.dnz-landing-root .work-card:hover{transform:translateY(-3px);box-shadow:0 20px 48px rgba(0,0,0,.45)}
.dnz-landing-root .work-card.featured{grid-column:span 2;aspect-ratio:21/9}
.dnz-landing-root .work-card img{width:100%;height:100%;object-fit:cover;opacity:.78;filter:saturate(.92) contrast(1.06);transition:opacity .35s,transform .8s ease}
.dnz-landing-root .work-card:hover img{opacity:.92;transform:scale(1.04)}
.dnz-landing-root .work-card::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,rgba(10,10,10,.08) 0%,rgba(10,10,10,.15) 42%,rgba(10,10,10,.88) 100%);pointer-events:none;transition:opacity .3s}
.dnz-landing-root .work-play{position:absolute;left:50%;top:46%;transform:translate(-50%,-50%) scale(.9);width:52px;height:52px;border:1px solid rgba(242,242,242,.35);border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(10,10,10,.45);opacity:0;transition:opacity .3s,transform .3s;pointer-events:none;z-index:2}
.dnz-landing-root .work-play svg{width:16px;height:16px;margin-left:2px}
.dnz-landing-root .work-card:hover .work-play{opacity:1;transform:translate(-50%,-50%) scale(1)}
.dnz-landing-root .work-caption{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:28px 28px 24px;pointer-events:none}
.dnz-landing-root .work-caption .cat{font-family:var(--M);font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--red);display:block;margin-bottom:8px}
.dnz-landing-root .work-caption .title{font-family:var(--D);font-size:clamp(28px,3.2vw,44px);letter-spacing:2px;line-height:.95;color:var(--white);font-weight:400}
.lightbox{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:24px;background:rgba(10,10,10,.94);backdrop-filter:blur(12px)}
.lightbox-dialog{position:relative;width:min(1080px,100%);border:1px solid var(--gray3);background:#000}
.lightbox-head{padding:14px 18px;border-bottom:1px solid var(--gray3);display:flex;align-items:center;justify-content:space-between;gap:16px}
.lightbox-title{font-family:var(--D);font-size:22px;letter-spacing:2px}
.lightbox-cat{font-family:var(--M);font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--red)}
.lightbox-video{aspect-ratio:16/9;background:#000}
.lightbox-video iframe{width:100%;height:100%;border:0}
.close-btn{position:absolute;right:0;bottom:calc(100% + 12px);width:44px;height:44px;border:1px solid var(--gray3);background:var(--black);color:var(--white);font-size:22px;cursor:pointer;font-family:var(--M);transition:border-color .2s}
.close-btn:hover{border-color:var(--red)}
.lightbox.vertical .lightbox-dialog{width:auto;max-width:min(460px,94vw)}
.lightbox.vertical .lightbox-video{aspect-ratio:9/16;width:min(380px,78vw);max-height:min(82vh,680px);margin:0 auto}
.dnz-landing-root #galeria{padding:120px 48px;background:var(--black)}
.dnz-landing-root .gallery-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-top:56px}
.dnz-landing-root .gallery-cell{position:relative;aspect-ratio:3/2;overflow:hidden;border:0;padding:0;background:#000;cursor:pointer}
.dnz-landing-root .gallery-cell img{width:100%;height:100%;object-fit:cover;opacity:.82;filter:saturate(.92) contrast(1.05);transition:opacity .35s,transform .8s ease}
.dnz-landing-root .gallery-cell:hover img{opacity:1;transform:scale(1.05)}
.dnz-landing-root .gallery-cell::after{content:'';position:absolute;inset:0;background:linear-gradient(180deg,transparent 55%,rgba(10,10,10,.55));pointer-events:none;opacity:0;transition:opacity .3s}
.dnz-landing-root .gallery-cell:hover::after{opacity:1}
.dnz-landing-root .gallery-plus{position:absolute;right:16px;bottom:12px;font-family:var(--D);font-size:34px;line-height:1;color:var(--white);opacity:0;transform:translateY(6px);transition:opacity .3s,transform .3s;pointer-events:none;z-index:2}
.dnz-landing-root .gallery-cell:hover .gallery-plus{opacity:1;transform:translateY(0)}
.gallery-lb{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;gap:8px;padding:24px;background:rgba(10,10,10,.96);backdrop-filter:blur(12px)}
.gallery-stage{position:relative;display:flex;flex-direction:column;align-items:center;max-width:min(1200px,92vw);margin:0}
.gallery-stage img{max-width:100%;max-height:82vh;object-fit:contain;border:1px solid var(--gray3)}
.gallery-counter{margin-top:16px;font-family:var(--M);font-size:10px;letter-spacing:4px;color:rgba(242,242,242,.5)}
.gallery-close{position:absolute;top:20px;right:24px;width:48px;height:48px;border:1px solid var(--gray3);background:var(--black);color:var(--white);font-size:24px;cursor:pointer;font-family:var(--M);transition:border-color .2s;z-index:2}
.gallery-close:hover{border-color:var(--red)}
.gallery-arrow{flex-shrink:0;width:56px;height:56px;border:1px solid var(--gray3);background:rgba(10,10,10,.6);color:var(--white);font-size:32px;line-height:1;cursor:pointer;font-family:var(--M);transition:border-color .2s,background .2s;display:flex;align-items:center;justify-content:center}
.gallery-arrow:hover{border-color:var(--red);background:var(--gray2)}
@media(max-width:900px){
  .dnz-landing-root .gallery-grid{grid-template-columns:repeat(2,1fr);gap:8px}
  .gallery-arrow{position:fixed;bottom:28px;width:52px;height:52px;z-index:2}
  .gallery-arrow.prev{left:24px}
  .gallery-arrow.next{right:24px}
  .gallery-stage img{max-height:70vh}
}
.dnz-landing-root #lutas{padding:120px 48px;background:var(--gray)}
.dnz-landing-root .reel-feed{display:flex;flex-direction:column;align-items:center;gap:40px;margin-top:56px}
.dnz-landing-root .reel-item{width:100%;display:flex;justify-content:center;scroll-snap-align:center}
.dnz-landing-root .reel-frame{position:relative;width:min(760px,100%);aspect-ratio:16/9;background:#000;border:1px solid var(--gray3);overflow:hidden;cursor:pointer}
.dnz-landing-root .reel-frame video{width:100%;height:100%;object-fit:cover;display:block;background:#000}
.dnz-landing-root .reel-center-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:72px;height:72px;border:1px solid rgba(242,242,242,.4);border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(10,10,10,.5);backdrop-filter:blur(8px);pointer-events:none;transition:opacity .25s}
.dnz-landing-root .reel-center-play svg{width:26px;height:26px;margin-left:4px}
.dnz-landing-root .reel-sound{position:absolute;top:16px;right:16px;width:44px;height:44px;border:1px solid var(--gray3);border-radius:50%;background:rgba(10,10,10,.55);backdrop-filter:blur(8px);cursor:pointer;display:flex;align-items:center;justify-content:center;z-index:3;transition:border-color .2s,transform .2s;opacity:.35}
.dnz-landing-root .reel-frame.show .reel-sound{opacity:1}
.dnz-landing-root .reel-sound:hover{border-color:var(--red);transform:scale(1.06)}
.dnz-landing-root .reel-sound svg{width:20px;height:20px}
.dnz-landing-root .reel-meta{position:absolute;left:0;right:0;bottom:0;z-index:2;padding:28px 26px 22px;pointer-events:none;background:linear-gradient(180deg,transparent,rgba(10,10,10,.82))}
.dnz-landing-root .reel-cat{display:block;font-family:var(--M);font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--red);margin-bottom:6px}
.dnz-landing-root .reel-name{font-family:var(--D);font-size:clamp(24px,3vw,38px);letter-spacing:2px;line-height:.95;color:var(--white)}
@media(max-width:900px){
  .dnz-landing-root .reel-feed{gap:28px}
}
.dnz-landing-root #eventos{padding:120px 48px;background:var(--gray)}
.dnz-landing-root .eventos-grid{display:grid;grid-template-columns:minmax(0,.95fr) minmax(260px,.75fr);gap:80px;align-items:center;margin-top:72px}
.dnz-landing-root .eventos-copy p{font-size:15px;line-height:1.9;color:rgba(242,242,242,.5);margin-bottom:20px}
.dnz-landing-root .eventos-copy p strong{color:var(--white);font-weight:500}
.dnz-landing-root .eventos-list{list-style:none;margin:32px 0 40px}
.dnz-landing-root .eventos-list li{font-family:var(--M);font-size:10px;letter-spacing:1px;color:rgba(242,242,242,.45);padding:12px 0;border-bottom:1px solid var(--gray3);display:flex;align-items:flex-start;gap:12px;line-height:1.6}
.dnz-landing-root .eventos-list li::before{content:'→';color:var(--red);flex-shrink:0}
.dnz-landing-root .eventos-phone-wrap{display:flex;justify-content:center;align-items:center}
.dnz-landing-root .phone-shell{width:min(290px,74vw);padding:14px;border:2px solid var(--gray3);border-radius:38px;background:linear-gradient(180deg,#1a1a1a,#0a0a0a);box-shadow:0 24px 80px rgba(0,0,0,.45),inset 0 0 0 1px rgba(242,242,242,.04);position:relative}
.dnz-landing-root .phone-shell::before{content:'';position:absolute;top:10px;left:50%;transform:translateX(-50%);width:84px;height:22px;background:var(--black);border-radius:0 0 14px 14px;border:1px solid var(--gray3);border-top:0;z-index:2}
.dnz-landing-root .phone-btn{width:100%;aspect-ratio:9/16;border:0;padding:0;border-radius:26px;overflow:hidden;position:relative;cursor:pointer;background:#000;display:block}
.dnz-landing-root .phone-btn img{width:100%;height:100%;object-fit:cover;opacity:.88;transition:opacity .25s,transform .7s}
.dnz-landing-root .phone-btn:hover img{opacity:.96;transform:scale(1.04)}
.dnz-landing-root .phone-overlay{position:absolute;inset:0;background:linear-gradient(180deg,transparent 45%,rgba(10,10,10,.82));pointer-events:none}
.dnz-landing-root .phone-play{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:58px;height:58px;border:1px solid rgba(242,242,242,.35);border-radius:50%;display:flex;align-items:center;justify-content:center;background:rgba(10,10,10,.55);backdrop-filter:blur(8px);transition:transform .25s,border-color .25s}
.dnz-landing-root .phone-btn:hover .phone-play{transform:translate(-50%,-50%) scale(1.08);border-color:var(--red)}
.dnz-landing-root .phone-play svg{width:20px;height:20px;margin-left:2px}
.dnz-landing-root .phone-cap{margin-top:16px;text-align:center;font-family:var(--M);font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--muted)}
.dnz-landing-root .phone-cap em{color:var(--red);font-style:normal}
.dnz-landing-root .ticker{border-top:1px solid var(--gray3);border-bottom:1px solid var(--gray3);padding:14px 0;overflow:hidden}
.dnz-landing-root .ticker-t{display:flex;gap:48px;animation:dnzTick 18s linear infinite;white-space:nowrap}
@keyframes dnzTick{from{transform:translateX(0)}to{transform:translateX(-50%)}}
.dnz-landing-root .ticker-i{font-family:var(--D);font-size:13px;letter-spacing:5px;color:rgba(242,242,242,.15);display:flex;align-items:center;gap:48px;flex-shrink:0}
.dnz-landing-root .ticker-i .r{width:5px;height:5px;background:var(--red);border-radius:50%}
.dnz-landing-root section[id]{scroll-margin-top:88px}
.dnz-landing-root #problema{padding:120px 48px;display:grid;grid-template-columns:1fr 1fr;gap:100px;align-items:center}
.dnz-landing-root .prob-left .label{font-family:var(--M);font-size:10px;letter-spacing:5px;text-transform:uppercase;color:var(--red);margin-bottom:32px;display:flex;align-items:center;gap:12px}
.dnz-landing-root .prob-left .label::after{content:'';flex:1;max-width:40px;height:1px;background:var(--gray3)}
.dnz-landing-root .prob-title{font-family:var(--D);font-size:clamp(48px,6vw,88px);line-height:.92;margin:0;font-weight:normal}
.dnz-landing-root .prob-title .dim{-webkit-text-stroke:1px rgba(242,242,242,.15);color:transparent}
.dnz-landing-root .prob-right p{font-size:15px;line-height:1.9;color:rgba(242,242,242,.5);margin-bottom:20px}
.dnz-landing-root .prob-right p strong{color:var(--white);font-weight:500}
.dnz-landing-root #solucao{padding:0 48px 120px}
.dnz-landing-root .sol-bar{height:1px;background:linear-gradient(to right,var(--red),transparent);margin-bottom:80px}
.dnz-landing-root .sol-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px}
@media(min-width:901px) and (max-width:1200px){.dnz-landing-root .sol-grid{grid-template-columns:repeat(2,1fr)}}
.dnz-landing-root .sol-card{background:var(--gray);padding:48px 36px;position:relative;overflow:hidden;transition:background .3s}
.dnz-landing-root .sol-card:hover{background:var(--gray2)}
.dnz-landing-root .sol-card::before{content:attr(data-n);position:absolute;top:-16px;right:16px;font-family:var(--D);font-size:120px;color:rgba(242,242,242,.03);line-height:1}
.dnz-landing-root .sol-icon{width:44px;height:44px;border:1px solid var(--gray3);display:flex;align-items:center;justify-content:center;margin-bottom:28px;font-size:18px}
.dnz-landing-root .sol-name{font-family:var(--D);font-size:30px;letter-spacing:2px;margin-bottom:16px}
.dnz-landing-root .sol-text{font-size:13px;line-height:1.8;color:rgba(242,242,242,.4)}
.dnz-landing-root .sol-text strong{color:rgba(242,242,242,.7);font-weight:500}
.dnz-landing-root #cases{padding:120px 48px;background:var(--gray)}
.dnz-landing-root .sec-head{margin-bottom:72px}
.dnz-landing-root .sec-label{font-family:var(--M);font-size:10px;letter-spacing:5px;text-transform:uppercase;color:var(--red);margin-bottom:20px;display:flex;align-items:center;gap:12px}
.dnz-landing-root .sec-label::after{content:'';flex:1;max-width:40px;height:1px;background:var(--gray3)}
.dnz-landing-root .sec-title{font-family:var(--D);font-size:clamp(52px,7vw,96px);line-height:.9;margin:0;font-weight:normal}
.dnz-landing-root .sec-sub{font-size:14px;line-height:1.8;color:rgba(242,242,242,.4);margin-top:16px;max-width:480px}
.dnz-landing-root .prob-right .arrow-down{display:inline-flex;align-items:center;gap:12px;font-family:var(--M);font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--red);margin-top:12px;text-decoration:none;transition:opacity .2s}
.dnz-landing-root .prob-right .arrow-down:hover{opacity:.75}
.dnz-landing-root .cases-list{display:flex;flex-direction:column;gap:2px}
.dnz-landing-root .case-item{background:var(--black);padding:48px 40px;display:grid;grid-template-columns:80px 1fr 1fr auto;gap:40px;align-items:center;transition:background .3s;cursor:default}
.dnz-landing-root .case-item.case-link{cursor:pointer}
.dnz-landing-root .case-item:hover{background:var(--gray2)}
.dnz-landing-root .case-item.case-link:focus-visible{outline:2px solid var(--red);outline-offset:4px}
.dnz-landing-root .case-n{font-family:var(--M);font-size:10px;letter-spacing:4px;color:var(--red)}
.dnz-landing-root .case-name{font-family:var(--D);font-size:40px;letter-spacing:2px}
.dnz-landing-root .case-type{font-family:var(--M);font-size:10px;letter-spacing:2px;color:var(--muted);margin-top:4px}
.dnz-landing-root .case-quote{font-size:13px;line-height:1.8;color:rgba(242,242,242,.45);font-style:italic;border-left:2px solid var(--red);padding-left:20px;max-width:360px}
.dnz-landing-root .case-quote cite{display:block;font-style:normal;font-family:var(--M);font-size:9px;letter-spacing:2px;color:var(--muted);margin-top:10px}
.dnz-landing-root .case-stat .val{font-family:var(--D);font-size:52px;line-height:1;color:var(--white)}
.dnz-landing-root .case-stat .val em{color:var(--red);font-style:normal}
.dnz-landing-root .case-stat .lbl{font-family:var(--M);font-size:9px;letter-spacing:3px;color:var(--muted)}
.dnz-landing-root #pacotes{padding:120px 48px}
.dnz-landing-root .pac-head{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:72px;gap:40px}
.dnz-landing-root .pac-note{font-size:13px;line-height:1.8;color:var(--muted);max-width:280px;text-align:right}
.dnz-landing-root .pac-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:2px}
.dnz-landing-root .pac-card{background:var(--gray);padding:44px 36px;display:flex;flex-direction:column;position:relative;transition:background .3s}
.dnz-landing-root .pac-card:hover{background:var(--gray2)}
.dnz-landing-root .pac-card.hot{background:var(--red)}
.dnz-landing-root .pac-card.hot:hover{background:#e02000}
.dnz-landing-root .pac-n{font-family:var(--M);font-size:9px;letter-spacing:4px;color:rgba(242,242,242,.3);margin-bottom:36px}
.dnz-landing-root .hot .pac-n{color:rgba(242,242,242,.5)}
.dnz-landing-root .pac-name{font-family:var(--D);font-size:52px;letter-spacing:4px;margin-bottom:4px}
.dnz-landing-root .pac-tag{font-family:var(--M);font-size:11px;line-height:1.6;color:rgba(242,242,242,.4);margin-bottom:36px;letter-spacing:.5px}
.dnz-landing-root .hot .pac-tag{color:rgba(242,242,242,.65)}
.dnz-landing-root .pac-list{list-style:none;margin-bottom:auto;padding-bottom:36px}
.dnz-landing-root .pac-list li{font-family:var(--M);font-size:10px;letter-spacing:1px;color:rgba(242,242,242,.45);padding:10px 0;border-bottom:1px solid rgba(242,242,242,.05);display:flex;align-items:flex-start;gap:10px;line-height:1.5}
.dnz-landing-root .hot .pac-list li{color:rgba(242,242,242,.7);border-bottom-color:rgba(242,242,242,.15)}
.dnz-landing-root .pac-list li::before{content:'→';color:var(--red);flex-shrink:0;font-size:11px}
.dnz-landing-root .hot .pac-list li::before{color:var(--white)}
.dnz-landing-root .pac-btn{display:inline-flex;align-items:center;gap:10px;font-family:var(--M);font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--white);text-decoration:none;padding-top:24px;border-top:1px solid rgba(242,242,242,.08);transition:gap .2s;margin-top:24px}
.dnz-landing-root .pac-btn:hover{gap:18px}
.dnz-landing-root .hot .pac-btn{border-top-color:rgba(242,242,242,.2)}
.dnz-landing-root #processo{padding:120px 48px;background:var(--gray)}
.dnz-landing-root .proc-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:2px;margin-top:72px}
.dnz-landing-root .proc-step{background:var(--black);padding:44px 32px;position:relative;overflow:hidden;transition:background .3s}
.dnz-landing-root .proc-step:hover{background:var(--gray2)}
.dnz-landing-root .proc-bg{position:absolute;top:-20px;right:8px;font-family:var(--D);font-size:130px;color:rgba(242,242,242,.03);line-height:1;pointer-events:none}
.dnz-landing-root .proc-line{position:absolute;bottom:0;left:0;right:0;height:2px;background:var(--red);transform:scaleX(0);transform-origin:left;transition:transform .4s}
.dnz-landing-root .proc-step:hover .proc-line{transform:scaleX(1)}
.dnz-landing-root .proc-icon{width:44px;height:44px;border:1px solid var(--gray3);display:flex;align-items:center;justify-content:center;margin-bottom:28px;font-size:18px}
.dnz-landing-root .proc-t{font-family:var(--D);font-size:28px;letter-spacing:2px;margin-bottom:14px}
.dnz-landing-root .proc-d{font-size:12px;line-height:1.8;color:rgba(242,242,242,.35)}
.dnz-landing-root #sobre{padding:120px 48px;background:var(--black);border-top:1px solid var(--gray3);border-bottom:1px solid var(--gray3)}
.dnz-landing-root .sobre-grid{display:grid;grid-template-columns:minmax(0,.58fr) minmax(300px,.42fr);gap:80px;align-items:center;margin-top:72px}
.dnz-landing-root .sobre-copy p{font-size:15px;line-height:1.9;color:rgba(242,242,242,.5);margin-bottom:20px}
.dnz-landing-root .sobre-copy p strong{color:var(--white);font-weight:500}
.dnz-landing-root .sobre-caps{display:grid;margin-top:40px;border-top:1px solid var(--gray3)}
.dnz-landing-root .sobre-cap{display:flex;justify-content:space-between;gap:20px;padding:16px 0;border-bottom:1px solid var(--gray3);font-size:13px;color:rgba(242,242,242,.45)}
.dnz-landing-root .sobre-cap strong{font-family:var(--M);font-size:10px;letter-spacing:2px;text-transform:uppercase;color:var(--white)}
.dnz-landing-root .sobre-photo{border:1px solid var(--gray3);overflow:hidden;background:var(--gray);aspect-ratio:4/5;max-height:620px}
.dnz-landing-root .sobre-photo img{width:100%;height:100%;object-fit:cover;object-position:center 18%;filter:saturate(.9) contrast(1.05)}
.dnz-landing-root #form-section{padding:120px 48px;background:var(--black)}
.dnz-landing-root .form-wrap{max-width:720px;margin:0 auto}
.dnz-landing-root .form-intro{margin-bottom:64px}
.dnz-landing-root .form-intro .sec-title{margin-bottom:20px}
.dnz-landing-root .form-intro p{font-size:15px;line-height:1.8;color:rgba(242,242,242,.45)}
.dnz-landing-root .form-steps{display:flex;gap:4px;margin-bottom:64px}
.dnz-landing-root .form-step-ind{flex:1;height:3px;background:var(--gray3);position:relative;overflow:hidden}
.dnz-landing-root .form-step-ind.active::after,.dnz-landing-root .form-step-ind.done::after{content:'';position:absolute;inset:0;background:var(--red);transform:scaleX(1)}
.dnz-landing-root .form-step-ind.active::after{animation:dnzFillBar .3s ease forwards}
.dnz-landing-root .form-step-ind.done::after{transform:scaleX(1)}
@keyframes dnzFillBar{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.dnz-landing-root .form-block{display:none}
.dnz-landing-root .form-block.active{display:block;animation:dnzFadeIn .3s ease}
@keyframes dnzFadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
.dnz-landing-root .form-q{font-family:var(--D);font-size:clamp(32px,4vw,52px);line-height:1;margin-bottom:8px}
.dnz-landing-root .form-q em{color:var(--red);font-style:normal}
.dnz-landing-root .form-hint{font-family:var(--M);font-size:10px;letter-spacing:3px;color:var(--muted);margin-bottom:40px}
.dnz-landing-root .form-opts{display:flex;flex-direction:column;gap:8px;margin-bottom:40px}
.dnz-landing-root .form-opt{display:flex;align-items:center;gap:16px;background:var(--gray);border:1px solid var(--gray3);padding:18px 24px;cursor:pointer;transition:all .2s;font-size:14px;color:rgba(242,242,242,.6);user-select:none}
.dnz-landing-root .form-opt:hover,.dnz-landing-root .form-opt.sel{background:var(--gray2);border-color:var(--red);color:var(--white)}
.dnz-landing-root .form-opt .opt-mark{width:18px;height:18px;border:1px solid var(--gray3);border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;transition:all .2s}
.dnz-landing-root .form-opt.sel .opt-mark{background:var(--red);border-color:var(--red)}
.dnz-landing-root .form-opt.sel .opt-mark::after{content:'';width:6px;height:6px;background:white;border-radius:50%}
.dnz-landing-root .form-input-wrap{margin-bottom:40px;position:relative}
.dnz-landing-root .form-input-wrap input,.dnz-landing-root .form-input-wrap textarea{width:100%;background:var(--gray);border:1px solid var(--gray3);color:var(--white);font-family:var(--B);font-size:16px;padding:20px 24px;outline:none;transition:border-color .2s;resize:none}
.dnz-landing-root .form-input-wrap input:focus,.dnz-landing-root .form-input-wrap textarea:focus{border-color:var(--red)}
.dnz-landing-root .form-input-wrap input::placeholder,.dnz-landing-root .form-input-wrap textarea::placeholder{color:var(--muted)}
.dnz-landing-root .form-input-wrap label{font-family:var(--M);font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--muted);display:block;margin-bottom:8px}
.dnz-landing-root .form-nav{display:flex;align-items:center;justify-content:space-between;gap:16px}
.dnz-landing-root .btn-next{display:inline-flex;align-items:center;gap:12px;background:var(--red);color:var(--white);font-family:var(--M);font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:18px 36px;border:none;cursor:pointer;transition:opacity .2s}
.dnz-landing-root .btn-next:hover{opacity:.85}
.dnz-landing-root .btn-next:disabled{opacity:.3;cursor:not-allowed}
.dnz-landing-root .btn-back{font-family:var(--M);font-size:10px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);background:none;border:none;cursor:pointer;transition:color .2s}
.dnz-landing-root .btn-back:hover{color:var(--white)}
.dnz-landing-root .form-counter{font-family:var(--M);font-size:10px;letter-spacing:3px;color:var(--muted)}
.dnz-landing-root .form-steps.hidden{display:none}
.dnz-landing-root .form-success{display:none;text-align:center;padding:60px 0;animation:dnzFadeIn .4s ease}
.dnz-landing-root .form-success.show{display:block}
.dnz-landing-root .success-icon{font-size:48px;margin-bottom:24px}
.dnz-landing-root .success-title{font-family:var(--D);font-size:52px;letter-spacing:2px;margin-bottom:16px}
.dnz-landing-root .success-text{font-size:14px;line-height:1.8;color:rgba(242,242,242,.45);margin-bottom:40px}
.dnz-landing-root .btn-wpp{display:inline-flex;align-items:center;gap:14px;background:#25D366;color:white;font-family:var(--M);font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:18px 36px;text-decoration:none;transition:opacity .2s;border:none;cursor:pointer}
.dnz-landing-root .btn-wpp:hover{opacity:.85}
.dnz-landing-root #cta-final{background:var(--red);padding:120px 48px;text-align:center;position:relative;overflow:hidden}
.dnz-landing-root #cta-final::before{content:'∅';position:absolute;font-family:var(--D);font-size:60vw;color:rgba(0,0,0,.06);top:50%;left:50%;transform:translate(-50%,-50%);pointer-events:none;line-height:1}
.dnz-landing-root .cta-inner{position:relative;z-index:2}
.dnz-landing-root .cta-over{font-family:var(--M);font-size:10px;letter-spacing:5px;text-transform:uppercase;color:rgba(242,242,242,.5);margin-bottom:28px}
.dnz-landing-root .cta-t{font-family:var(--D);font-size:clamp(64px,11vw,150px);line-height:.88;margin-bottom:48px}
.dnz-landing-root .cta-btns{display:flex;gap:12px;justify-content:center;flex-wrap:wrap}
.dnz-landing-root .btn-white{display:inline-flex;align-items:center;gap:12px;background:var(--white);color:var(--black);font-family:var(--M);font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:18px 36px;text-decoration:none;transition:all .25s;border:none;cursor:pointer}
.dnz-landing-root .btn-white:hover{background:var(--black);color:var(--white)}
.dnz-landing-root .btn-out-w{display:inline-flex;align-items:center;gap:12px;border:1px solid rgba(242,242,242,.3);color:var(--white);font-family:var(--M);font-size:11px;letter-spacing:3px;text-transform:uppercase;padding:18px 36px;text-decoration:none;transition:all .25s}
.dnz-landing-root .btn-out-w:hover{background:rgba(242,242,242,.1)}
.dnz-landing-root footer{background:var(--black);border-top:1px solid var(--gray3);padding:64px 48px 32px}
.dnz-landing-root .f-top{display:flex;align-items:flex-start;justify-content:space-between;flex-wrap:wrap;gap:40px;padding-bottom:40px;border-bottom:1px solid var(--gray3)}
.dnz-landing-root .f-brand{max-width:360px}
.dnz-landing-root .f-logo{display:block;line-height:0}
.dnz-landing-root .f-logo img{height:48px;width:auto;filter:hue-rotate(338deg) saturate(1.35) brightness(1.02);opacity:.85}
.dnz-landing-root .f-tag{font-family:var(--M);font-size:9px;letter-spacing:4px;color:var(--muted);margin-top:10px}
.dnz-landing-root .f-blurb{font-size:12px;line-height:1.8;color:rgba(242,242,242,.35);margin-top:18px}
.dnz-landing-root .f-links{display:flex;gap:24px 28px;list-style:none;flex-wrap:wrap;max-width:520px;justify-content:flex-end}
.dnz-landing-root .f-links a,.dnz-landing-root .f-links button{font-family:var(--M);font-size:9px;letter-spacing:3px;text-transform:uppercase;color:var(--muted);text-decoration:none;transition:color .2s;background:none;border:0;cursor:pointer}
.dnz-landing-root .f-links a:hover,.dnz-landing-root .f-links button:hover{color:var(--white)}
.dnz-landing-root .f-bottom{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:16px;padding-top:28px}
.dnz-landing-root .f-copy{font-family:var(--M);font-size:9px;letter-spacing:2px;color:var(--muted)}
.dnz-landing-root .f-credit{font-family:var(--M);font-size:9px;letter-spacing:2px;color:var(--muted)}
.dnz-landing-root .f-credit a{color:rgba(242,242,242,.7);text-decoration:none;border-bottom:1px solid var(--red);padding-bottom:2px;transition:color .2s}
.dnz-landing-root .f-credit a:hover{color:var(--red)}
.float-actions{position:fixed;bottom:28px;right:28px;z-index:200;display:flex;flex-direction:column;gap:12px;align-items:flex-end;transition:opacity .3s ease,transform .3s ease}
.float-actions.hidden{opacity:0;transform:translateY(24px) scale(.9);pointer-events:none}
.wpp-fixed,.ig-fixed{width:54px;height:54px;border-radius:50%;display:flex;align-items:center;justify-content:center;text-decoration:none;transition:all .3s;position:relative}
.wpp-fixed{background:#25D366;box-shadow:0 4px 24px rgba(37,211,102,.35)}
.wpp-fixed:hover{transform:scale(1.08) translateY(-2px);box-shadow:0 8px 32px rgba(37,211,102,.45)}
.ig-fixed{background:linear-gradient(135deg,#833ab4,#fd1d1d,#fcb045);box-shadow:0 4px 24px rgba(253,29,29,.3)}
.ig-fixed:hover{transform:scale(1.08) translateY(-2px);box-shadow:0 8px 32px rgba(253,29,29,.4)}
.float-tip{position:absolute;right:64px;background:var(--black);color:var(--white);font-family:var(--M);font-size:9px;letter-spacing:3px;white-space:nowrap;padding:8px 14px;border:1px solid var(--gray3);opacity:0;transition:opacity .2s;pointer-events:none}
.wpp-fixed:hover .float-tip,.ig-fixed:hover .float-tip{opacity:1}
.dnz-landing-root .fu{opacity:0;transform:translateY(28px);transition:opacity .6s ease,transform .6s ease}
.dnz-landing-root .fu.vis{opacity:1;transform:translateY(0)}
@media(prefers-reduced-motion:reduce){
  .dnz-landing-root .ticker-t{animation:none}
  .dnz-landing-root .fu{opacity:1;transform:none;transition:none}
  .dnz-landing-root .form-block.active{animation:none}
}
@media(max-width:900px){
  .dnz-landing-root nav{padding:16px 24px}
  .dnz-landing-root .nav-links{display:none}
  .dnz-landing-root .nav-login-mobile{display:inline-flex;align-items:center;font-family:var(--M);font-size:10px;letter-spacing:2px;text-transform:uppercase;background:none;border:1px solid var(--gray3);color:rgba(242,242,242,.7);padding:8px 10px;cursor:pointer;transition:border-color .2s,color .2s}
  .dnz-landing-root .nav-login-mobile:hover{border-color:var(--red);color:var(--white)}
  .dnz-landing-root .nav-r{gap:8px}
  .dnz-landing-root .nav-cta{padding:10px 14px;font-size:9px}
  .dnz-landing-root .lang-toggle{padding:8px 9px;font-size:9px}
  .dnz-landing-root #hero{padding:96px 24px 60px}
  .dnz-landing-root .nav-logo img{height:44px}
  .dnz-landing-root .hero-bottom{flex-direction:column;align-items:flex-start}
  .dnz-landing-root section,.dnz-landing-root #problema,.dnz-landing-root #solucao,.dnz-landing-root #eventos,.dnz-landing-root #trabalhos,.dnz-landing-root #cases,.dnz-landing-root #pacotes,.dnz-landing-root #processo,.dnz-landing-root #sobre,.dnz-landing-root #form-section,.dnz-landing-root #cta-final{padding:80px 24px}
  .dnz-landing-root .eventos-grid{grid-template-columns:1fr;gap:48px}
  .dnz-landing-root .eventos-phone-wrap{order:-1}
  .dnz-landing-root .sobre-grid{grid-template-columns:1fr;gap:40px;margin-top:48px}
  .dnz-landing-root .sobre-photo{max-height:480px}
  .dnz-landing-root .work-grid{grid-template-columns:1fr}
  .dnz-landing-root .work-card.featured{grid-column:span 1;aspect-ratio:16/10}
  .dnz-landing-root .reel-overlay{padding:18px 20px}
  .dnz-landing-root .reel-play{width:52px;height:52px;font-size:14px}
  .dnz-landing-root #problema{grid-template-columns:1fr;gap:48px}
  .dnz-landing-root .sol-grid,.dnz-landing-root .pac-grid{grid-template-columns:1fr}
  .dnz-landing-root .proc-grid{grid-template-columns:repeat(2,1fr)}
  .dnz-landing-root .case-item{grid-template-columns:1fr;gap:20px}
  .dnz-landing-root .pac-head{flex-direction:column;align-items:flex-start}
  .dnz-landing-root .pac-note{text-align:left}
  .dnz-landing-root footer{padding:48px 24px 28px}
  .dnz-landing-root .f-top{flex-direction:column;gap:32px}
  .dnz-landing-root .f-links{flex-wrap:wrap;justify-content:flex-start;max-width:none}
  .dnz-landing-root .f-bottom{flex-direction:column;align-items:flex-start;gap:10px}
}
      `}</style>

      <div id="main-content" className="dnz-landing-root">
        <nav>
          <a href="#hero" className="nav-logo" onClick={e => scrollTo(e, "#hero")} aria-label={t("nav.logoAria")}>
            <img src={LOGO_SRC} alt="DNZ Films" />
          </a>
          <div className="nav-r">
            <ul className="nav-links">
              <li><a href="#trabalhos" onClick={e => scrollTo(e, "#trabalhos")}>{t("nav.trabalhos")}</a></li>
              <li><a href="#lutas" onClick={e => scrollTo(e, "#lutas")}>{t("nav.lutas")}</a></li>
              <li><a href="#galeria" onClick={e => scrollTo(e, "#galeria")}>{t("nav.galeria")}</a></li>
              <li><a href="#cases" onClick={e => scrollTo(e, "#cases")}>{t("nav.cases")}</a></li>
              <li><a href="#sobre" onClick={e => scrollTo(e, "#sobre")}>{t("nav.sobre")}</a></li>
              <li><a href="#pacotes" onClick={e => scrollTo(e, "#pacotes")}>{t("nav.pacotes")}</a></li>
              <li><button type="button" onClick={onLogin}>{t("nav.login")}</button></li>
            </ul>
            <button type="button" className="lang-toggle" onClick={toggleLang} aria-label={t("nav.langAria")}>
              <span className={lang === "pt" ? "on" : ""}>PT</span>/<span className={lang === "en" ? "on" : ""}>EN</span>
            </button>
            <button type="button" className="nav-login-mobile" onClick={onLogin}>{t("nav.login")}</button>
            <a href="#form-section" className="nav-cta" onClick={e => scrollTo(e, "#form-section")}>{t("nav.cta")}</a>
          </div>
        </nav>

        <section id="hero">
          <div className="hero-bg">
            <div className="hero-noise"></div>
            <div className="hero-grad"></div>
            <div className="hero-lines"></div>
          </div>
          <div className="hero-scroll"></div>
          <div className="hero-inner">
            <div className="hero-tag">{t("hero.tag")}</div>
            <div className="hero-h">
              DOES<br />
              NOT<br />
              <span className="cross">ZERO</span>
            </div>
            <div className="hero-sub">DNZ FILMS</div>
            <div className="hero-bottom">
              <p className="hero-desc">
                <strong>{t("hero.descStrong")}</strong><br />
                {t("hero.descText")}
              </p>
              <div className="hero-actions">
                <a href="#form-section" className="btn-red" onClick={e => scrollTo(e, "#form-section")}>{t("hero.ctaStart")}</a>
                <a href="#trabalhos" className="btn-ghost" onClick={e => scrollTo(e, "#trabalhos")}>{t("hero.ctaPortfolio")}</a>
              </div>
            </div>
          </div>
          <div className="hero-reel">
            <button type="button" className="reel-btn" onClick={() => openVideo("1177771656")} aria-label={t("hero.showreelAria")}>
              <img src="/dnz-assets/showreel-preview.webp" alt={t("hero.showreelAlt")} loading="eager" />
              <div className="reel-overlay">
                <div>
                  <div className="reel-label">{t("hero.reelLabel")}</div>
                  <div className="reel-title">{t("hero.reelTitle")}</div>
                </div>
                <div className="reel-play" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PLAY_SVG }} />
              </div>
            </button>
          </div>
        </section>

        <div className="ticker">
          <div className="ticker-t">
            {[...t("ticker.items"), ...t("ticker.items")].map((item, idx) => (
              <div className="ticker-i" key={`${item}-${idx}`}>{item} <span className="r"></span></div>
            ))}
          </div>
        </div>

        <section id="problema" className="landing-section fu">
          <div className="prob-left">
            <div className="label">{t("problem.label")}</div>
            <h2 className="prob-title">
              {t("problem.title1")}<br />
              {t("problem.title2")}<br />
              <span className="dim">{t("problem.title3dim")}</span><br />
              {t("problem.title4")}
            </h2>
          </div>
          <div className="prob-right">
            <p>{t("problem.p1")}</p>
            <p dangerouslySetInnerHTML={{ __html: t("problem.p2") }} />
            <p>{t("problem.p3")}</p>
            <p dangerouslySetInnerHTML={{ __html: t("problem.p4") }} />
            <a href="#solucao" className="arrow-down" onClick={e => scrollTo(e, "#solucao")}>{t("problem.link")}</a>
          </div>
        </section>

        <section id="solucao" className="landing-section fu">
          <div className="sol-bar"></div>
          <div className="sol-grid">
            {t("solucao.cards").map(s => (
              <div className="sol-card" data-n={s.n} key={s.n}>
                <div className="sol-icon">{s.icon}</div>
                <div className="sol-name">{s.name}</div>
                <p className="sol-text" dangerouslySetInnerHTML={{ __html: s.text }} />
              </div>
            ))}
          </div>
        </section>

        <section id="eventos" className="landing-section fu">
          <div className="sec-label">{t("eventos.label")}</div>
          <h2 className="sec-title">{t("eventos.title1")}<br />{t("eventos.title2")}</h2>
          <div className="eventos-grid">
            <div className="eventos-copy">
              <p dangerouslySetInnerHTML={{ __html: t("eventos.p1") }} />
              <p dangerouslySetInnerHTML={{ __html: t("eventos.p2") }} />
              <ul className="eventos-list">
                <li>{t("eventos.list1")}</li>
                <li>{t("eventos.list2")}</li>
                <li>{t("eventos.list3")}</li>
                <li>{t("eventos.list4")}</li>
              </ul>
              <button className="btn-red" onClick={() => preset(t("form.step1.options")[5][0], t("form.step2.options2")[1][0])}>{t("eventos.btn")}</button>
            </div>
            <div className="eventos-phone-wrap">
              <div>
                <div className="phone-shell">
                  <button type="button" className="phone-btn" onClick={() => openVideo("1177798436", true)} aria-label={t("eventos.videoAria")}>
                    <img src="/dnz-assets/social-impact.webp" alt={t("eventos.videoAlt")} loading="lazy" />
                    <div className="phone-overlay"></div>
                    <span className="phone-play" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PLAY_SVG }} />
                  </button>
                </div>
                <div className="phone-cap"><em>9:16</em> · {t("eventos.phoneCap")}</div>
              </div>
            </div>
          </div>
        </section>

        <section id="trabalhos" className="landing-section fu">
          <div className="sec-head">
            <div className="sec-label">{t("trabalhos.label")}</div>
            <h2 className="sec-title">{t("trabalhos.title1")}<br />{t("trabalhos.title2")}</h2>
          </div>
          <div className="work-grid">
            {portfolioItems.map(item => (
              <button className={`work-card${item.featured ? " featured" : ""}`} type="button" key={item.vimeoId} onClick={() => openVideo(item.vimeoId)} aria-label={t("trabalhos.watchAria", { title: item.title })}>
                <img src={item.thumb} alt={item.title} loading="lazy" />
                <span className="work-play" aria-hidden="true" dangerouslySetInnerHTML={{ __html: PLAY_SVG }} />
                <span className="work-caption">
                  <span className="cat">{t(`categories.${item.category}`)}</span>
                  <span className="title">{item.title}</span>
                </span>
              </button>
            ))}
          </div>
        </section>

        <section id="lutas" className="landing-section fu">
          <div className="sec-head">
            <div className="sec-label">{t("lutas.label")}</div>
            <h2 className="sec-title">{t("lutas.title1")}<br />{t("lutas.title2")}</h2>
            <p className="sec-sub">{t("lutas.sub")}</p>
          </div>
          <div className="reel-feed">
            {fightItems.map(item => (
              <FeedVideo key={item.src} item={item} t={t} />
            ))}
          </div>
        </section>

        <section id="galeria" className="landing-section fu">
          <div className="sec-head">
            <div className="sec-label">{t("galeria.label")}</div>
            <h2 className="sec-title">{t("galeria.title1")}<br />{t("galeria.title2")}</h2>
            <p className="sec-sub">{t("galeria.sub")}</p>
          </div>
          <div className="gallery-grid">
            {galleryStills.map((s, i) => (
              <button type="button" className="gallery-cell" key={s.src} onClick={() => openGallery(i)} aria-label={t("galeria.expandAria", { i: i + 1, total: galleryStills.length })}>
                <img src={s.src} alt={`${t("galeria.altPrefix")} ${String(i + 1).padStart(2, "0")}`} loading="lazy" />
                <span className="gallery-plus" aria-hidden="true">+</span>
              </button>
            ))}
          </div>
        </section>

        <section id="cases" className="landing-section fu">
          <div className="sec-head">
            <div className="sec-label">{t("cases.label")}</div>
            <h2 className="sec-title">{t("cases.title1")}<br />{t("cases.title2")}</h2>
          </div>
          <div className="cases-list">
            <div className="case-item">
              <div className="case-n">01</div>
              <div>
                <div className="case-name">LA MISSION</div>
                <div className="case-type">{t("cases.c1type")}</div>
              </div>
              <div className="case-quote">
                {t("cases.c1quote")}
                <cite>{t("cases.c1cite")}</cite>
              </div>
              <div className="case-stat">
                <div className="val">∅</div>
                <div className="lbl">{t("cases.c1lbl")}</div>
              </div>
            </div>
            <div className="case-item case-link" role="button" tabIndex={0} onClick={() => openVideo("1177774829")} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openVideo("1177774829"); } }} aria-label={t("cases.c2aria")}>
              <div className="case-n">02</div>
              <div>
                <div className="case-name">JP SURFBOARDS</div>
                <div className="case-type">{t("cases.c2type")}</div>
              </div>
              <div className="case-quote">
                {t("cases.c2quote")}
                <cite>{t("cases.c2cite")}</cite>
              </div>
              <div className="case-stat">
                <div className="val">∅</div>
                <div className="lbl">{t("cases.c2lbl")}</div>
              </div>
            </div>
            <div className="case-item">
              <div className="case-n">03</div>
              <div>
                <div className="case-name">{t("cases.c3name")}</div>
                <div className="case-type">{t("cases.c3type")}</div>
              </div>
              <div className="case-quote">
                {t("cases.c3quote")}
              </div>
              <div className="case-stat">
                <a href="#form-section" className="btn-red" style={{ fontSize: 10, padding: "14px 24px" }} onClick={e => { e.preventDefault(); preset("", ""); }}>{t("cases.c3btn")}</a>
              </div>
            </div>
          </div>
        </section>

        <section id="sobre" className="landing-section fu">
          <div className="sec-label">{t("sobre.label")}</div>
          <h2 className="sec-title">{t("sobre.title1")}<br />{t("sobre.title2")}</h2>
          <div className="sobre-grid">
            <div className="sobre-copy">
              <p dangerouslySetInnerHTML={{ __html: t("sobre.p1") }} />
              <p dangerouslySetInnerHTML={{ __html: t("sobre.p2") }} />
              <p dangerouslySetInnerHTML={{ __html: t("sobre.p3") }} />
              <div className="sobre-caps">
                <div className="sobre-cap"><strong>{t("sobre.cap1t")}</strong><span>{t("sobre.cap1d")}</span></div>
                <div className="sobre-cap"><strong>{t("sobre.cap2t")}</strong><span>{t("sobre.cap2d")}</span></div>
                <div className="sobre-cap"><strong>{t("sobre.cap3t")}</strong><span>{t("sobre.cap3d")}</span></div>
              </div>
            </div>
            <div className="sobre-photo">
              <img src="/dnz-assets/dante.webp" alt={t("sobre.photoAlt")} loading="lazy" />
            </div>
          </div>
        </section>

        <section id="pacotes" className="landing-section fu">
          <div className="pac-head">
            <div>
              <div className="sec-label">{t("pacotes.label")}</div>
              <h2 className="sec-title">{t("pacotes.title1")}<br />{t("pacotes.title2")}</h2>
            </div>
            <p className="pac-note">{t("pacotes.note")}</p>
          </div>
          <div className="pac-grid">
            <div className="pac-card">
              <div className="pac-n">{t("pacotes.loop.n")}</div>
              <div className="pac-name">LOOP</div>
              <div className="pac-tag">{t("pacotes.loop.tag")}</div>
              <ul className="pac-list">
                <li>{t("pacotes.loop.list1")}</li>
                <li>{t("pacotes.loop.list2")}</li>
                <li>{t("pacotes.loop.list3")}</li>
                <li>{t("pacotes.loop.list4")}</li>
                <li>{t("pacotes.loop.list5")}</li>
                <li>{t("pacotes.loop.list6")}</li>
                <li>{t("pacotes.loop.list7")}</li>
                <li>{t("pacotes.loop.list8")}</li>
              </ul>
              <a href="#form-section" className="pac-btn" onClick={e => { e.preventDefault(); preset(t("form.step1.options")[1][0], t("form.step2.options2")[0][0]); }}>{t("pacotes.loop.btn")}</a>
            </div>
            <div className="pac-card hot">
              <div className="pac-n">{t("pacotes.motion.n")}</div>
              <div className="pac-name">MOTION</div>
              <div className="pac-tag">{t("pacotes.motion.tag")}</div>
              <ul className="pac-list">
                <li>{t("pacotes.motion.list1")}</li>
                <li>{t("pacotes.motion.list2")}</li>
                <li>{t("pacotes.motion.list3")}</li>
                <li>{t("pacotes.motion.list4")}</li>
                <li>{t("pacotes.motion.list5")}</li>
                <li>{t("pacotes.motion.list6")}</li>
                <li>{t("pacotes.motion.list7")}</li>
                <li>{t("pacotes.motion.list8")}</li>
              </ul>
              <a href="#form-section" className="pac-btn" onClick={e => { e.preventDefault(); preset(t("form.step1.options")[4][0], t("form.step2.options2")[1][0]); }}>{t("pacotes.motion.btn")}</a>
            </div>
            <div className="pac-card">
              <div className="pac-n">{t("pacotes.zero.n")}</div>
              <div className="pac-name">ZERO</div>
              <div className="pac-tag">{t("pacotes.zero.tag")}</div>
              <ul className="pac-list">
                <li>{t("pacotes.zero.list1")}</li>
                <li>{t("pacotes.zero.list2")}</li>
                <li>{t("pacotes.zero.list3")}</li>
                <li>{t("pacotes.zero.list4")}</li>
                <li>{t("pacotes.zero.list5")}</li>
                <li>{t("pacotes.zero.list6")}</li>
                <li>{t("pacotes.zero.list7")}</li>
                <li>{t("pacotes.zero.list8")}</li>
              </ul>
              <a href="#form-section" className="pac-btn" onClick={e => { e.preventDefault(); preset(t("form.step1.options")[8][0], t("form.step2.options2")[2][0]); }}>{t("pacotes.zero.btn")}</a>
            </div>
          </div>
        </section>

        <section id="processo" className="landing-section fu">
          <div className="sec-label">{t("processo.label")}</div>
          <h2 className="sec-title">{t("processo.title1")}<br />{t("processo.title2")}</h2>
          <div className="proc-grid">
            {t("processo.steps").map(p => (
              <div className="proc-step" key={p.bg}>
                <div className="proc-bg">{p.bg}</div>
                <div className="proc-line"></div>
                <div className="proc-icon">{p.icon}</div>
                <div className="proc-t">{p.t}</div>
                <div className="proc-d">{p.d}</div>
              </div>
            ))}
          </div>
        </section>

        <section id="form-section">
          <div className="form-wrap">
            <div className="form-intro fu">
              <div className="sec-label">{t("form.label")}</div>
              <h2 className="sec-title">{t("form.title1")}<br />{t("form.title2")}</h2>
              <p>{t("form.intro")}</p>
            </div>
            <div className={`form-steps${submitted ? " hidden" : ""}`}>
              <div className={`form-step-ind${step > 1 ? " done" : ""}${step === 1 ? " active" : ""}`}></div>
              <div className={`form-step-ind${step > 2 ? " done" : ""}${step === 2 ? " active" : ""}`}></div>
              <div className={`form-step-ind${step > 3 ? " done" : ""}${step === 3 ? " active" : ""}`}></div>
              <div className={`form-step-ind${step > 4 ? " done" : ""}${step === 4 ? " active" : ""}`}></div>
            </div>

            <div className={`form-block${step === 1 ? " active" : ""}`}>
              <div className="form-q" dangerouslySetInnerHTML={{ __html: t("form.step1.question") }} />
              <div className="form-hint">{t("form.step1.hint")}</div>
              <div className="form-opts">
                {t("form.step1.options").map(([key, label]) => (
                  <div key={key} className={`form-opt${answers.project === key ? " sel" : ""}`} role="button" tabIndex={0} onClick={() => selectOpt("project", key)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectOpt("project", key); } }} aria-pressed={answers.project === key}>
                    <div className="opt-mark"></div>
                    {label}
                  </div>
                ))}
              </div>
              <div className="form-nav">
                <div className="form-counter">1 / 4</div>
                <button className="btn-next" disabled={!answers.project} onClick={() => goToStep(2)}>{t("form.next")}</button>
              </div>
            </div>

            <div className={`form-block${step === 2 ? " active" : ""}`}>
              <div className="form-q" dangerouslySetInnerHTML={{ __html: t("form.step2.question") }} />
              <div className="form-hint">{t("form.step2.hint")}</div>
              <div className="form-opts">
                {t("form.step2.options").map(([key, label]) => (
                  <div key={key} className={`form-opt${answers.service === key ? " sel" : ""}`} role="button" tabIndex={0} onClick={() => selectOpt("service", key)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectOpt("service", key); } }} aria-pressed={answers.service === key}>
                    <div className="opt-mark"></div>
                    {label}
                  </div>
                ))}
              </div>
              <div className="form-hint" style={{ marginTop: 32, marginBottom: 24 }}>{t("form.step2.hint2")}</div>
              <div className="form-opts">
                {t("form.step2.options2").map(([key, label]) => (
                  <div key={key} className={`form-opt${answers.package === key ? " sel" : ""}`} role="button" tabIndex={0} onClick={() => selectOpt("package", key)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectOpt("package", key); } }} aria-pressed={answers.package === key}>
                    <div className="opt-mark"></div>
                    {label}
                  </div>
                ))}
              </div>
              <div className="form-nav">
                <button className="btn-back" onClick={() => goToStep(1)}>{t("form.back")}</button>
                <div className="form-counter">2 / 4</div>
                <button className="btn-next" disabled={!answers.service} onClick={() => goToStep(3)}>{t("form.next")}</button>
              </div>
            </div>

            <div className={`form-block${step === 3 ? " active" : ""}`}>
              <div className="form-q" dangerouslySetInnerHTML={{ __html: t("form.step3.question") }} />
              <div className="form-hint">{t("form.step3.hint")}</div>
              <div className="form-opts">
                {t("form.step3.options").map(([key, label]) => (
                  <div key={key} className={`form-opt${answers.deadline === key ? " sel" : ""}`} role="button" tabIndex={0} onClick={() => selectOpt("deadline", key)} onKeyDown={e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectOpt("deadline", key); } }} aria-pressed={answers.deadline === key}>
                    <div className="opt-mark"></div>
                    {label}
                  </div>
                ))}
              </div>
              <div className="form-nav">
                <button className="btn-back" onClick={() => goToStep(2)}>{t("form.back")}</button>
                <div className="form-counter">3 / 4</div>
                <button className="btn-next" disabled={!answers.deadline} onClick={() => goToStep(4)}>{t("form.next")}</button>
              </div>
            </div>

            <div className={`form-block${step === 4 ? " active" : ""}`}>
              <div className="form-q" dangerouslySetInnerHTML={{ __html: t("form.step4.question") }} />
              <div className="form-hint">{t("form.step4.hint")}</div>
              <div className="form-input-wrap">
                <label>{t("form.step4.nameLabel")}</label>
                <input type="text" placeholder={t("form.step4.namePlaceholder")} autoComplete="name" required value={answers.nome} onChange={e => setAnswers(prev => ({ ...prev, nome: e.target.value }))} />
              </div>
              <div className="form-input-wrap">
                <label>{t("form.step4.wppLabel")}</label>
                <input type="tel" placeholder={t("form.step4.wppPlaceholder")} autoComplete="tel" inputMode="tel" required value={answers.wpp} onChange={e => setAnswers(prev => ({ ...prev, wpp: formatPhone(e.target.value) }))} />
              </div>
              <div className="form-input-wrap">
                <label>{t("form.step4.igLabel")}</label>
                <input type="text" placeholder={t("form.step4.igPlaceholder")} value={answers.ig} onChange={e => setAnswers(prev => ({ ...prev, ig: e.target.value }))} />
              </div>
              <div className="form-input-wrap">
                <label>{t("form.step4.msgLabel")}</label>
                <textarea rows="3" placeholder={t("form.step4.msgPlaceholder")} value={answers.msg} onChange={e => setAnswers(prev => ({ ...prev, msg: e.target.value }))}></textarea>
              </div>
              <div className="form-nav">
                <button className="btn-back" onClick={() => goToStep(3)}>{t("form.back")}</button>
                <div className="form-counter">4 / 4</div>
                <button className="btn-next" disabled={!checkS4} onClick={handleSubmit}>{t("form.submit")}</button>
              </div>
            </div>

            <div className={`form-success${submitted ? " show" : ""}`}>
              <div className="success-icon">⚡</div>
              <div className="success-title">{t("form.success.title")}</div>
              <p className="success-text" dangerouslySetInnerHTML={{ __html: t("form.success.text") }} />
              <a href={submitted ? buildWppUrl() : "#"} className="btn-wpp" id="wpp-link" target="_blank" rel="noopener noreferrer">
                <WhatsAppSvg />
                {t("form.success.btn")}
              </a>
            </div>
          </div>
        </section>

        <section id="cta-final">
          <div className="cta-inner">
            <div className="cta-over">{t("cta.over")}</div>
            <div className="cta-t" dangerouslySetInnerHTML={{ __html: t("cta.title") }} />
            <div className="cta-btns">
              <a href="#form-section" className="btn-white" onClick={e => scrollTo(e, "#form-section")}>{t("cta.btnStart")}</a>
              <a href={INSTAGRAM_URL} className="btn-out-w" target="_blank" rel="noopener noreferrer">{t("cta.btnInstagram")}</a>
            </div>
          </div>
        </section>

        <footer ref={footerRef}>
          <div className="f-top">
            <div className="f-brand">
              <a href="#hero" className="f-logo" onClick={e => scrollTo(e, "#hero")} aria-label={t("footer.logoAria")}>
                <img src={LOGO_SRC} alt="DNZ Films" />
              </a>
              <div className="f-tag">{t("footer.tag")}</div>
              <p className="f-blurb">{t("footer.blurb")}</p>
            </div>
            <ul className="f-links">
              <li><a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">@doesnotzero</a></li>
              <li><a href={`https://wa.me/${SALES_WHATSAPP}`} target="_blank" rel="noopener noreferrer">WhatsApp</a></li>
              <li><a href="#trabalhos" onClick={e => scrollTo(e, "#trabalhos")}>{t("footer.trabalhos")}</a></li>
              <li><a href="#lutas" onClick={e => scrollTo(e, "#lutas")}>{t("footer.lutas")}</a></li>
              <li><a href="#galeria" onClick={e => scrollTo(e, "#galeria")}>{t("footer.galeria")}</a></li>
              <li><a href="#eventos" onClick={e => scrollTo(e, "#eventos")}>{t("footer.eventos")}</a></li>
              <li><a href="#cases" onClick={e => scrollTo(e, "#cases")}>{t("footer.cases")}</a></li>
              <li><a href="#sobre" onClick={e => scrollTo(e, "#sobre")}>{t("footer.sobre")}</a></li>
              <li><a href="#pacotes" onClick={e => scrollTo(e, "#pacotes")}>{t("footer.pacotes")}</a></li>
              <li><a href="#form-section" onClick={e => scrollTo(e, "#form-section")}>{t("footer.briefing")}</a></li>
              <li><button type="button" onClick={onLogin}>{t("footer.login")}</button></li>
              <li><button type="button" className="lang-toggle" onClick={toggleLang} aria-label={t("nav.langAria")}>
                <span className={lang === "pt" ? "on" : ""}>PT</span>/<span className={lang === "en" ? "on" : ""}>EN</span>
              </button></li>
            </ul>
          </div>
          <div className="f-bottom">
            <div className="f-copy">{t("footer.copyPrefix")} <span id="year"></span> {t("footer.copySuffix")}</div>
            <div className="f-credit">
              {t("footer.creditPrefix")}<a href={INSTAGRAM_DEV_URL} target="_blank" rel="noopener noreferrer">doesnotzerodev</a>
            </div>
          </div>
        </footer>

        {lightboxOpen && (
          <div className={`lightbox${lightboxVertical ? " vertical" : ""}`} role="dialog" aria-modal="true" aria-label={t("lightbox.dialogAria")} onClick={e => { if (e.target === e.currentTarget) closeVideo(); }}>
            <div className="lightbox-dialog">
              <button className="close-btn" type="button" id="lightboxClose" onClick={closeVideo} aria-label={t("lightbox.closeAria")}>×</button>
              <div className="lightbox-head" id="lightboxHead">
                <div>
                  <div className="lightbox-cat" id="lightboxCat">{lightboxMeta.category}</div>
                  <div className="lightbox-title" id="lightboxTitle">{lightboxMeta.title}</div>
                </div>
              </div>
              <div className="lightbox-video" id="lightboxVideo"></div>
            </div>
          </div>
        )}

        {galleryIndex !== null && (
          <div className="gallery-lb" role="dialog" aria-modal="true" aria-label={t("galeria.dialogAria")} onClick={e => { if (e.target === e.currentTarget) closeGallery(); }}>
            <button className="gallery-close" type="button" id="galleryClose" onClick={closeGallery} aria-label={t("galeria.closeAria")}>×</button>
            <button className="gallery-arrow prev" type="button" onClick={() => galleryNav(-1)} aria-label={t("galeria.prevAria")}>‹</button>
            <figure className="gallery-stage">
              <img src={galleryStills[galleryIndex].src} alt={`${t("galeria.altPrefix")} ${String(galleryIndex + 1).padStart(2, "0")}`} />
              <figcaption className="gallery-counter">{galleryIndex + 1} / {galleryStills.length}</figcaption>
            </figure>
            <button className="gallery-arrow next" type="button" onClick={() => galleryNav(1)} aria-label={t("galeria.nextAria")}>›</button>
          </div>
        )}

        <div className={`float-actions${floatHidden ? " hidden" : ""}`}>
          <a href={`https://wa.me/${SALES_WHATSAPP}?text=${encodeURIComponent(t("float.wppMsg"))}`} className="wpp-fixed" target="_blank" rel="noopener noreferrer" aria-label={t("float.wppAria")}>
            <span className="float-tip">{t("float.wppTip")}</span>
            <WhatsAppSvg size={26} />
          </a>
          <a href={INSTAGRAM_URL} className="ig-fixed" target="_blank" rel="noopener noreferrer" aria-label={t("float.igAria")}>
            <span className="float-tip">{t("float.igTip")}</span>
            <InstagramSvg />
          </a>
        </div>
      </div>
    </>
  );
};

export { LandingPage, LoginPage };
