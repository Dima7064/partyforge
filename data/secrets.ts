export interface SecretSeed {
  text: string;
  tags: string[];
}

export const secrets: SecretSeed[] = [
  { text: "Скрывает, что на самом деле является незаконнорожденным наследником знатного рода.", tags: ["political", "noble", "fighter"] },
  { text: "Не помнит событий последних трёх лет своей жизни.", tags: ["dark", "wizard", "sorcerer"] },
  { text: "Должен выполнить древнее обещание, данное много лет назад.", tags: ["heroic", "religious", "cleric"] },
  { text: "Тайно влюблён в одного из членов партии.", tags: ["heroic", "comedic", "bard"] },
  { text: "Нарушил клятву, которую давал богам, и боится последствий.", tags: ["religious", "paladin", "cleric"] },
  { text: "Боится своей магической силы и того, что может случиться при потере контроля.", tags: ["dark", "sorcerer", "wizard"] },
  { text: "Состоит в тайном обществе, о котором не должен рассказывать.", tags: ["political", "rogue", "warlock"] },
  { text: "Утаил от партии важную находку или артефакт.", tags: ["political", "rogue", "wizard"] },
  { text: "Скрывает, что на самом деле не хочет быть героем.", tags: ["comedic", "heroic", "any"] },
  { text: "Ищет лекарство от редкой болезни, которой заражён.", tags: ["heroic", "ranger", "druid"] },
  { text: "Заключил невыгодную сделку с могущественной сущностью.", tags: ["dark", "warlock", "sorcerer"] },
  { text: "Скрывает, что потерял семейную реликвию, которую должен был беречь.", tags: ["heroic", "fighter", "cleric"] },
  { text: "Виноват в ошибке, которая привела к провалу важного задания.", tags: ["dark", "fighter", "ranger"] },
  { text: "Пытается сбежать от навязанного родителями брака.", tags: ["political", "noble", "bard"] },
  { text: "Притворяется более опытным воином, чем есть на самом деле.", tags: ["comedic", "fighter", "rogue"] },
  { text: "Должен выполнить опасное поручение от своей гильдии, чтобы сохранить место в ней.", tags: ["political", "rogue", "bard"] },
  { text: "Скрывает, что видел вещий сон о будущем мира.", tags: ["religious", "cleric", "wizard"] },
  { text: "Обладает проклятым предметом, который не может выбросить.", tags: ["dark", "warlock", "rogue"] },
  { text: "Скрывает свою принадлежность к враждебной фракции.", tags: ["political", "fighter", "rogue"] },
  { text: "Совершил подлог документов, чтобы его взяли в партию.", tags: ["political", "bard", "rogue"] },
  { text: "Боится, что его семья узнает, чем он занимается.", tags: ["heroic", "comedic", "any"] },
  { text: "Скрывает, что у него есть дар предвидения.", tags: ["religious", "wizard", "sorcerer"] },
  { text: "Тайно ищет способ снять родовое проклятие.", tags: ["dark", "religious", "cleric"] },
  { text: "Скрывает, что раньше был дипломатическим шпионом.", tags: ["political", "rogue", "bard"] },
  { text: "Страдает от ночных кошмаров, но не говорит об этом.", tags: ["dark", "heroic", "any"] },
  { text: "Хочет разгадать секрет, который охраняет партия.", tags: ["political", "rogue", "wizard"] },
  { text: "Скрывает, что его магия работает не так, как у других.", tags: ["wild", "sorcerer", "warlock"] },
  { text: "Пообещал кому-то, что найдёт и защитит партию.", tags: ["heroic", "paladin", "cleric"] },
  { text: "Не умеет читать, но стыдится в этом признаться.", tags: ["comedic", "barbarian", "fighter"] },
  { text: "На самом деле происходит из очень далёких земель.", tags: ["wild", "ranger", "druid"] },
];