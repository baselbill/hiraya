// Website menu. German base text and prices; translations live in ITEM_I18N (src/i18n.js).
// Every item id here must exist in ITEM_I18N. Prices must match Just Eat and Uber Eats.
// The in-store board (/menu) reads src/data/menu.json instead. That file is the master
// menu (DE + EN, piece prices). This website menu is not generated from it yet.
export const MENU = {
  starters: {
    items: [
      { id: 'start-edm', name: 'Edamame',       ingredients: 'Gedämpfte Sojabohnen · Meersalz',                                                              price: 7,  kind: 'side', tags: ['vegan'], cooking: 'G', img: '/menu/start-edm.webp' },
      { id: 'start-mis', name: 'Miso Suppe',    ingredients: 'Miso-Paste · Tofu · Wakame · Frühlingszwiebeln',                                               price: 7,  kind: 'side', tags: ['veg'],  cooking: 'G', img: '/menu/start-miso.webp' },
      { id: 'start-gun', name: 'Gunkan',        ingredients: 'Spicy Lachs · Spicy Thun · Roter Kaviar · Wakame · Krabbe oder Muschel — 6 Variationen',       price: 8,  kind: 'side', tags: ['spicy'], cooking: 'R', teaser: true, img: '/menu/gunkan.webp' },
      { id: 'start-tem', name: 'Temaki',        ingredients: 'Handgerollte Tüte · Lachs, Thun, Krabbenfleisch oder Veggie',                                  price: 11, kind: 'side', tags: [], cooking: 'R', img: '/menu/tema-sal.webp' },
      { id: 'start-tat', name: 'Fisch Tataki',  ingredients: 'Kurz flambierter Fisch · Ponzu-Dressing · 2 Variationen',                                      price: 16, kind: 'side', tags: [], cooking: 'F', priceFrom: true, img: '/menu/tatk-tun.webp' },
      { id: 'start-sas', name: 'Fisch Sashimi', ingredients: 'Frischer Fisch in dünne Scheiben geschnitten · Ponzu · 3 Variationen',                         price: 16, kind: 'side', tags: [], cooking: 'R', priceFrom: true, img: '/menu/start-sas.webp' },
    ],
  },
  rolls: {
    items: [
      { id: 'roll-dyn',  name: 'Dynamite Roll',        ingredients: 'Lachs · Mango · Surimi · Kaviar · Zwiebeln · Sauce',                                   price: 11.00, priceFrom: true, kind: 'maki', tags: ['spicy', 'bestseller'], teaser: true, img: '/menu/roll-dyn.webp', cooking: 'R' },
      { id: 'roll-spl',  name: 'Spicy Lachs',          ingredients: 'Lachs · Zwiebeln · Gurke',                                                             price: 10.00, priceFrom: true, kind: 'maki', tags: ['spicy'],                              img: '/menu/roll-spl.webp', cooking: 'R' },
      { id: 'roll-spt',  name: 'Spicy Thun',           ingredients: 'Thunfisch · Zwiebeln · Gurke',                                                         price: 10.00, priceFrom: true, kind: 'maki', tags: ['spicy'],                              img: '/menu/roll-spt.webp', cooking: 'R' },
      { id: 'roll-tmp',  name: 'Tempura Roll',         ingredients: 'Crevetten-Tempura · Avocado · Sesam · Zwiebeln · Mayo · Sauce',                        price: 10.00, priceFrom: true, kind: 'maki', tags: [],                                    img: '/menu/roll-tmp.webp', cooking: 'G' },
      { id: 'roll-cat',  name: 'Caterpillar Roll',     ingredients: 'Crevetten-Tempura · Gurke · Avocado · Sesam · Sauce',                                  price: 11.00, priceFrom: true, kind: 'maki', tags: [],                                    img: '/menu/roll-cat.webp', cooking: 'G' },
      { id: 'roll-tbl',  name: 'Tuna Blast',           ingredients: 'Thunfisch · Gurke · Avocado · Mango · Scharfe Sauce',                                  price: 11.00, priceFrom: true, kind: 'maki', tags: ['spicy'],                              img: '/menu/roll-tbl.webp', cooking: 'R' },
      { id: 'roll-swi',  name: 'Swish Roll',           ingredients: 'Flambierter Lachs · Avocado · Mango · Surimi · Jalapeño · Sesam · Sauce',             price: 11.00, priceFrom: true, kind: 'maki', tags: ['spicy'],                              img: '/menu/roll-swi.webp', cooking: 'F' },
      { id: 'roll-kru',  name: 'Kiwi Rainbow Uramaki', ingredients: 'Apfel · Avocado · Karotte · Pistazie · Kiwi · Gurke · Sauce',                         price: 10.50, priceFrom: true, kind: 'maki', tags: ['veg'],                               img: '/menu/roll-kru.webp', cooking: 'G' },
      { id: 'roll-vip',  name: 'VIP Roll',          ingredients: 'Jakobsmuscheln · Karotte · Avocado · Gurke · Sauce',                                   price: 11.00, priceFrom: true, kind: 'maki', tags: ['veg'],                               img: '/menu/roll-vip.webp', cooking: 'R' },
      { id: 'roll-mix',  name: 'Hausmix Roll',         ingredients: 'Lachs · Thun · Mango · Avocado · Sesam · Sauce',                                       price: 11.00, priceFrom: true, kind: 'maki', tags: [],                                    cooking: 'R', img: '/menu/roll-hous.webp' },
      { id: 'roll-una',  name: 'Unagi Rainbow Roll',   ingredients: 'Aal · Avocado · Gurke · Surimi · Sesam · Sauce',                                       price: 11.00, priceFrom: true, kind: 'maki', tags: [],                                    cooking: 'G', img: '/menu/roll-una.webp' },
      { id: 'roll-vfm',  name: 'Veggie Fotomaki',      ingredients: 'Avocado · Gurke · Mango · Rettich · Apfel · Kampyo',                                   price: 10.00, priceFrom: true, kind: 'maki', tags: ['veg'],                               cooking: 'G', img: '/menu/roll-foto.webp' },
    ],
  },
  sets: {
    items: [
      { id: 'set-mix2',  name: 'Mix Sushi 2',             ingredients: '14 Stück · 4 Uramaki · 4 Nigiri (2× Lachs, Ebi, Thun) · 6 Hosomaki (Lachs, Avo) — unser meistbestelltes Set', price: 25, kind: 'set', tags: [], teaser: true, img: '/menu/set-mix2.webp', cooking: 'R' },
      { id: 'set-sho',   name: 'Shohuko Teller',          ingredients: '18 Stück · 4 Rainbow Lachs · 4 Rainbow Thun · 3 Lachs Maki · 3 Thun Maki · 4 Nigiri',                         price: 35, kind: 'set', tags: [],                                                    cooking: 'R', img: '/menu/set-sho.webp' },
      { id: 'set-vegi',  name: 'Mix Vegi',                ingredients: '11 Stück · 4 Veggi Roll · 4 Vegi Maki · 3 Vegi Nigiri · Avo, Mango, Gurke, Inari',                            price: 21, kind: 'set', tags: ['veg'],                         img: '/menu/set-vegi.webp', cooking: 'G' },
      { id: 'set-vhoso', name: '24 Stück Veggie Hosomaki',ingredients: '24 Stück · 6× Avocado · 6× Mango · 6× Gurke · 6× Eingelegter Rettich',                                       price: 26, kind: 'set', tags: ['vegan'],                       img: '/menu/set-vhoso.webp', cooking: 'G' },
      { id: 'set-party', name: 'Sushi Party Platter',     ingredients: 'Gemischter Teller für Gruppen · Uramaki, Hosomaki, Nigiri, Sashimi oder Gunkan — Ghers Auswahl · 3 Variationen', price: 110, priceFrom: true, kind: 'set', tags: [], img: '/menu/set-party.webp', cooking: 'R' },
    ],
  },
  poke: {
    items: [
      { id: 'poke-sal',  name: 'Lachs Poke Bowl',      ingredients: 'Lachs · Avocado · Gurke · Rettich · Edamame · Mango · Poke-Sauce',                price: 22.00, kind: 'bowl',  tags: ['bestseller'], teaser: true, img: '/menu/poke-sal.webp', cooking: 'R' },
      { id: 'poke-tu',   name: 'Thun Poke Bowl',       ingredients: 'Thunfisch · Avocado · Gurke · Rettich · Edamame · Mango · Poke-Sauce',             price: 22.00, kind: 'bowl',  tags: [],                              img: '/menu/poke-tu.webp',  cooking: 'R' },
      { id: 'poke-shr',  name: 'Crevetten Poke Bowl',  ingredients: 'Crevetten · Avocado · Gurke · Rettich · Edamame · Mango · Poke-Sauce',             price: 22.00, kind: 'bowl',  tags: [],                              img: '/menu/poke-shr.webp', cooking: 'G' },
      { id: 'poke-veg',  name: 'Veggie Poke Bowl',     ingredients: 'Avocado · Mango · Gurke · Edamame · Wakame-Salat · Takuan · Tamago',               price: 20.00, kind: 'bowl',  tags: ['veg'],                         img: '/menu/poke-veg.webp', cooking: 'G' },
      { id: 'bento-lac', name: 'Lachs Bento Box',      ingredients: 'Sushi-Reis · Flambierter Lachs · 4 Nigiri · Marktsalat · Wakame-Salat · Sauce',   price: 25.00, kind: 'bento', tags: [],                                                        cooking: 'F', img: '/menu/bent-sal.webp' },
      { id: 'bento-tu',  name: 'Thun Bento Box',       ingredients: 'Sushi-Reis · Flambierter Thunfisch · 4 Nigiri · Marktsalat · Wakame-Salat · Sauce', price: 25.00, kind: 'bento', tags: [],                                                      cooking: 'F', img: '/menu/bent-tun.webp' },
    ],
  },
};
