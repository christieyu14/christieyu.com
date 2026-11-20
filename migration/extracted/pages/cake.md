# Christie Yu - Architecting Cake

- URL: https://christieyu.com/cake
- Canonical: https://christieyu.com/cake
- Kind: project
- Adobe page id: p67d62fd97813d65c9b4ff4e73ccf7ed9e44bafe286100527c7927
- Extracted: 2026-11-20T01:05:39.993Z

## Meta description

I co-created Cake UI, Lenovo’s new unified design language, mapping 500+ variables to 100+ components in Figma. I used Cake to redesign Lenovo Vantage, a consumer app with 3mil+ daily usership.

## Modules

### 1. text

#### Architecting Cake: “Baking” a design system from scratch

### 2. image

- Image: https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/2d7e16c7-a4ca-4f3e-8dd9-744924a36b20.png?h=a28521230d95218570df05e54c724f1a

### 3. text

Most people are familiar with Lenovo as a hardware company. But, as Lenovo moves deeper into the device ecosystem space — producing tablets & Motorola phones on top of its famous “Think” PC line — its enterprise software apps (Lenovo Vantage, Lenovo Freestyle, Legion Gaming, Motorola Ready-For) are more and more what customers “feel” when they think about Lenovo.

It makes sense, then, that as part of the newest "One Lenovo" push, one of Lenovo leadership’s major priorities is unifying Lenovo’s software design systems.

I was lucky enough to get the chance to push that project forward when I rotated onto Diana Gerli’s Software UX team in Lenovo’s Intelligent Devices Group (IDG) in February of 2023. Her team has done amazing work, like transforming old-style Vantage into “new” Vantage, using their new design system, Cake, on Figma.

- Link: One Lenovo → https://news.lenovo.com/pressroom/press-releases/global-everything-as-a-service-strategy/

### 4. media_collection

1. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/34cc1bd5-ca49-4cb8-987c-67773f926276_rw_1200.png?h=b46c6c2b84f76b809dc04842a2e2cad8
2. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/2cba59c6-b04f-4796-82b1-7d4d839c9456_rw_1920.png?h=d1d465539c7f7c2754885ac01ff8757a

### 5. text

Caption: “Old” Vantage on the left, “new” Vantage on the right. You can see that Cake applies modern, dynamic, modular design to a somewhat outdated dashboard.

### 6. text

Vantage is an onboarding app that comes with all Lenovo devices. It has over 3.3 million usership per day, largely in the China geo. It helps monitor device health and has immediate support for Lenovo-related services, like warranties and parts purchases. It has badly needed a design overhaul to match Lenovo’s vision for innovation.

I arrived onto this project when the dashboard above had just been released for production by Software UX. Much of my work on the team focused on redesigning Vantage settings, which makes up the largest portion of Vantage functionality – not only “reskinning” it, so to speak, but really investigating current consumer pain points and inefficiencies with the app.

In doing so, I quickly realized that we needed to progress Cake – as of then only a partially fleshed-out design system – to keep up with the speed at which we were remaking Vantage. Not only that, some major systemic infrastructure work had to take place.

Along with my co-architects Mike DeMar and Mallory Schultz, we formed a 3-person hyper task squad establishing foundations and components of Cake, working in parallel as we tackled major Vantage tasks.

- Link: Vantage → https://www.lenovo.com/us/en/software/vantage/

### 7. media_collection

1. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/9c616a10-98fe-49b7-9645-359d66d8d5cb_rw_1920.png?h=858a612b5cb28ec09ca44b27f0bdd245
2. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/cefacbb3-fdef-47be-9455-7c918dc8d000_rw_1920.png?h=5c0685676edc7f6ee05143ed5acf8207
3. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/3019ee98-47c0-4bd9-88dd-b1d85790f478_rw_1920.png?h=7ade8c17402f3836f733df4c48cf67a2

### 8. text

Color was another major focus. We delved deeply into the world of dark mode theming and high-contrast theming. Luckily for us, Figma rolled out their 2023 update, which included extremely critical color variable & layer theming functionalities.

### 9. media_collection

1. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/1ace30e6-438e-4ec6-b25e-fafa35f93156_rw_1920.png?h=92f00b6f961750f2cce538fd55559991
2. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/e6c35ddc-2f7a-488e-8c1e-77216ae735d9_rw_1200.png?h=1de62d38590d61752eab6a025786722c
3. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/6384e414-669e-4ba3-a10c-487a6c724258_rw_1920.png?h=d980326040b08562498fe58143c068c6
4. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/a038d675-99d9-4c10-9995-727f88e4dc42_rw_1920.png?h=1cbb4dffbb6d7d3b26d814e5b32ac842

### 10. text

Then, we used Brad Frost’s “Atomic Theory” of design to start making “atoms” – such as checkboxes and buttons – as well as “molecules” – e.g. inputs and modals.

- Link: “Atomic Theory” → https://atomicdesign.bradfrost.com/chapter-2/

Being a UX architect involves a somewhat different skillset than a visual designer, interaction designer, UX researcher, or UX writer. I called upon my front-end engineering skills to coordinate closely with our development team, creating pipelines from Figma to GitHub and GitHub to documentation. We experimented with platforms like Storybook, ZeroHeight, and Docusaurus. Each token we created was not just a design choice but a design product – optimization & longevity were always at the forefront of our minds as we developed this design system from the ground up. In many ways, we were product owners as well as designers.

- Link: Storybook → https://storybook.js.org/
- Link: ZeroHeight → https://zeroheight.com/
- Link: Docusaurus → https://docusaurus.io/

### 11. text

#### Use Case 1: Vantage Power Settings redesign

### 12. text

Power is one of the most complex settings pages on Vantage. With huge variety between PC verticals on what “smart power” settings are offered, what types of battery warranties are possible, what kind of battery metrics are measured, etc, the Power page required a lot of consideration for modularity, customizability, and clarity.

### 13. media_collection

1. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/a98ebcc9-b311-4fac-8b4b-73055e4b35c9_rw_1920.png?h=844fc2df2f6059d407af789f69532d22
2. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/bc713095-e156-4187-8a4d-a8772934612c_rw_1200.png?h=591e8563025484c3bb49ec4c4f48e206
3. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/cfe74243-a3c3-4141-90de-11a4ce4f3196_rw_1920.png?h=d9909ee23d203571ccc599bf637d7aa3

### 14. text

Power page grooming/3-amigos meetings often resulted in spreads like this. Definitely a strong candidate for Charlie Day meme usage.

### 15. text

Our drafts & iteration process looked something like this:

### 16. media_collection

1. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/e7781c03-f11d-4e88-8357-1f8c5ee07495_rw_1920.png?h=715d1719a30ed73d9e27bb7efb2125d2
2. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/9d62a3de-119d-4320-b534-cb068ae99b2a_rw_1920.png?h=3151b7afc2e6876e1d7dfe1c656232f8

### 17. image

- Image: https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/63a4c1b8-d911-4647-aab4-c6617fdb10aa.png?h=18a072c318d50430967f2b303060ebad

### 18. text

And here’s what we finally came up with.

### 19. image

- Image: https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/ce1f7581-61bb-4442-a5f5-b813b7badc3c.png?h=9865001e6cb767861dbfea126dc4bd2a

### 20. text

#### Use Case 2: Vantage Hardware Scan

### 21. text

Another major Vantage functionality is Hardware Scan, which is tricky from a design perspective because of how much data has to be crammed into one view. We had to be creative with patterns like accordions & modals in order to extract content into readable & logical information hierarchies.

### 22. media_collection

1. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/4311d3c5-5a3c-41f0-9449-125ad57c0857_rw_1920.png?h=093b028e735e1dc2c15525b07b15fd58
2. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/4ec781e2-5994-4510-a7e0-9ab3fc676e27_rw_1920.png?h=f274c4eafbb584b249f7ce5d1b3063aa
3. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/3c8d9a0d-a73a-4c3c-947a-ba5a19136ef2_rw_1920.png?h=3f7988e95d77c30ff22db538c84c06ea
4. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/1045bddc-d7fb-43f4-91e6-96ce99055409_rw_1920.png?h=ac3d7b42fa5b16feeff538d574e9fac1

### 23. text

Here is another example of the “Cake-ification” of old Vantage design.

### 24. text

And here is what we landed on.

### 25. media_collection

1. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/10dc24b1-b2fd-4864-b415-5164cbefc533_rw_1920.png?h=ff2d47c69a490d4061e6824514aca705
2. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/738ac735-8fb1-49d7-a051-c951cbff3630_rw_1200.png?h=d2255cdf7a1bd5624b08b5b5f5b95e51
3. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/37cd14a5-d198-4a99-8b95-24788e185868_rw_1200.png?h=db85644bf0c4bd5a356de9d3b28aa581

### 26. text

And within Hardware Scan were other tools such as Snapshot, which allows users to compare before and after scans of their hardware & software. This was particularly data heavy.

### 27. media_collection

1. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/e9ea4971-32f7-4659-b13e-fa3669c05ce7_rw_1920.png?h=799b312748f57dbfe86e2dcd3f5a49f8
2. https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/d074d64d-2d06-439b-8b4d-2821fcf4eb3e_rw_1920.png?h=8f99886a850c991ac1b756381cc3b42c

### 28. text

The final product:

### 29. image

- Image: https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/da246f9b-5a77-44be-a6a1-622bfadf3144.png?h=4597516341fad56f3f7a4e3551c32786

### 30. text

Hardware Scan had so many micro-functionalities and requirements that our Figma spread looked something like this on our last iteration:

### 31. image

- Image: https://cdn.myportfolio.com/c7e93eda-a4d0-46e4-920f-c5a1915a4d2c/8cb0dcd1-9c9d-45b5-bf96-8198d50b2907.png?h=e70a0c367a8b858e21c99261b6748656

## Extraction notes

- Some images only expose a resized or cropped CDN derivative. The unsuffixed original URL is not in the public HTML for those assets.
- Captions are separate text modules with class caption. They are not attributes on the image tag, and the image alt attribute is empty.
- One or more content images have no alt text in the public HTML.
