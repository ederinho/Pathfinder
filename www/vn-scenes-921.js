// Demonstration dialogue content, separate from the engine. Not the authored prologue.
const end={label:'Zakończ rozmowę',end:true};
const back={label:'Wróć do rozmowy',to:'intro'};
export const scenes={
 kaelWorldEntry:{name:'Kael',location:'Sala Gildii',theme:'hall',symbol:'⚔',npc:'kael',portrait:'kael',returning:'Witaj ponownie, Wędrowcze. Ogień nadal płonie.',start:'intro',nodes:{
 intro:{lines:['Witaj, Wędrowcze. Nie każda droga wymaga pośpiechu.','Co sprowadza cię dzisiaj do Gildii?'],choices:[{label:'Chcę zaplanować dzień.',to:'plan'},{label:'Jak działa Gildia?',to:'about'},end]},
 plan:{lines:['Powiedz mi, ile masz czasu i czego potrzebujesz. Poszukamy właściwego kontraktu.'],choices:[{label:'Przejdź do konsultacji AI',service:'kaelWorldEntry'},back,end]},
 about:{lines:['Zlecenia są sposobem na stawianie kolejnych kroków. To ty wybierasz, które przyjąć.','Nie musisz wykonywać wszystkiego naraz.'],choices:[back,end]}}},
 merchantWorldEntry:{name:'Rovan',location:'Kram Rovana',theme:'market',symbol:'◈',npc:'merchant',portrait:'rovan',returning:'Znów się spotykamy. Rozejrzyj się, może coś ci się przyda.',start:'intro',nodes:{
 intro:{lines:['Witaj w moim kramie. Dobry płaszcz nie wybierze za ciebie drogi, ale może ci na niej towarzyszyć.'],choices:[{label:'Pokaż mi towary.',service:'merchantWorldEntry'},{label:'Czy wyposażenie daje mi przewagę?',to:'about'},end]},
 about:{lines:['Moje towary zmieniają wyposażenie, nie przyspieszają zdobywania doświadczenia. Wybierz coś, co ci odpowiada.'],choices:[back,end]}}},
 oracleWorldEntry:{name:'Wyrocznia',location:'Sanktuarium',theme:'sanctuary',symbol:'◇',npc:'oracle',portrait:'oracle',returning:'Witaj ponownie. Czy od naszego spotkania coś się zmieniło?',start:'intro',nodes:{
 intro:{lines:['Nie widzę twojej przyszłości. Mogę jednak pomóc ci dostrzec drogi, których jeszcze nie rozważyłeś.'],choices:[{label:'Chcę porozmawiać o swojej drodze.',to:'consult'},{label:'Czym jest konsultacja?',to:'about'},end]},
 consult:{lines:['Zacznij od własnych słów. Nie musisz mieć gotowej odpowiedzi.'],choices:[{label:'Otwórz lub wznów konsultację AI',service:'oracleWorldEntry'},back,end]},
 about:{lines:['Możesz zatrzymać rozmowę i wrócić później. Decyzje pozostają twoje.'],choices:[back,end]}}}
};
