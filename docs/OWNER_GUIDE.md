# Hiraya Website: Owner's Guide

A plain-language overview of your website. No technical knowledge needed.

## What you have

A one-page website at **https://hiraya.ch** that presents Hiraya to visitors. It is available in **German, French, Italian and English**, and it switches automatically to the visitor's browser language. Visitors can also switch language themselves.

The website **does not take orders itself**. It shows the menu and then sends the customer to **Just Eat** or **Uber Eats** to order and pay. Your delivery platforms stay the place where orders, payments and customer data are handled.

## What visitors see (top to bottom)

1. **Short intro animation** with the Hiraya name (once per visit).
2. **Header and main photo** with the order buttons.
3. **Your story**: Filipino soul, Japanese technique.
4. **The menu**: 29 dishes in four groups (Starters & Specials, Hiraya Rolls, Sushi Sets, Poke & Bento). Each dish has a photo, ingredients, price, and labels (spicy, vegetarian, vegan, bestseller, raw / cooked / flambéed).
5. **How to order** (Just Eat or Uber Eats).
6. **Where to find you**: map, address (Paradiesstrasse 2, Binningen), opening hours, phone.
7. **Catering and party platters**: an email button for requests to info@hiraya.ch.
8. **About Chef Gher**.
9. **Footer** with contact details, Instagram and Facebook links.

## What the website does not have

- No online ordering or payment on the site itself
- No customer accounts or customer database
- No visitor tracking or statistics
- No contact form (visitors use the email and phone links)
- No imprint or privacy page (worth asking a developer or advisor whether you need one)

Because the site stores no customer data, there is little to protect or back up.

## What it costs and where it lives

| Item | Notes |
|---|---|
| Website code and hosting | Stored on **GitHub** and published with **GitHub Pages**, which is free for this type of site |
| Domain **hiraya.ch** | Yearly registration fee paid to the domain registrar. *Who registered it and where is listed in the [Handoff Checklist](HANDOFF_CHECKLIST.md); please confirm.* |
| Fonts | Free Google Fonts |

The domain is the one thing that can make your site disappear if the renewal is missed. Make sure the renewal reminders go to **your** email address.

## What you own and must keep access to

1. **The domain hiraya.ch.** You should be the registered owner, or have the registrar login.
2. **The GitHub repository** (`baselbill/hiraya`). This is the website itself. It is currently under a personal GitHub account. You should either be added as an owner or have it transferred to an account that belongs to Hiraya.
3. **Photos and menu texts.** Original photos are stored in the repository.

The [Handoff Checklist](HANDOFF_CHECKLIST.md) lists everything to confirm.

## How changes are made

Everything on the website is changed by editing the code, so you need a developer for each change. Here are the usual requests, with the information a developer needs:

| You want to… | Tell the developer |
|---|---|
| Change a price | Dish name, new price. **Update Just Eat and Uber Eats at the same time** so they match. |
| Add or remove a dish | Name, ingredients in your languages if possible, price, and a good photo (landscape or square, well lit). |
| Change opening hours or phone | New values. These appear in several places, so mention every place they apply. |
| Add a holiday notice | Text and dates. |
| Change photos | Send the new photos. |

A change normally goes live **a minute or two** after the developer publishes it.

Opening hours, phone, email and links are stored in one place in the code, so those changes are quick. The delivery promises ("about 25 minutes", "minimum CHF 30") are written into the text in four languages, so tell the developer if they change.

Each dish needs translations in four languages. If you do not provide them, the developer can draft them, but please have a native speaker check them.

## Things to keep in mind

- **Keep the website and the delivery platforms consistent.** The website shows a short menu of 29 items. The full menu (about 60 items, including single nigiri and maki) is only on Just Eat and Uber Eats. This was a deliberate choice, described in the [menu strategy report](archive/Hiraya_Menu_Renovation.pdf).
- **Prices on the site are a snapshot.** Prices shown must be updated by hand whenever you change them on the platforms.
- **Photos matter.** Dishes without a photo show a grey placeholder, so every new dish needs a good photo.
- **Reference documents** about menu ideas and the marketing review are in [docs/archive](archive). They are background reading, not instructions.

## Who to contact

| For | Contact |
|---|---|
| Website changes or problems | Your developer (see the [Handoff Checklist](HANDOFF_CHECKLIST.md)) |
| Domain, renewal | Your domain registrar |
| Orders, payments, delivery | Just Eat / Uber Eats support |

## If the website is down

1. Check **https://hiraya.ch** on your phone's mobile data (not Wi-Fi) to rule out local problems.
2. Check whether the **domain renewal** has lapsed. This is the most likely cause.
3. Tell your developer. They can look at the "Actions" page on GitHub to see whether the last publish failed.
