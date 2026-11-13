# “Learning Guide” – README

The information in this README should be considered as suggestions. We are happy to engage in direct exchange with you about your ideas.

## Background of the Challenge

**The problem:** In many cities, including Heilbronn, there are countless institutions offering leisure activities for children and adolescents – from creative workshops to sports courses. But: Each has its own website. How is anyone supposed to keep track? Many people don’t even know what’s available in their area – and miss out on opportunities that would be perfect for them.

**Why it's worth it:** Leisure courses are more than just a pastime. They help you **learn new things** and develop yourself, discover **hidden talents**, better understand **today's and tomorrow's world** – and most importantly: **have fun!**

**The challenge:** A course that doesn’t match one’s interests can quickly reduce motivation. And once someone loses the desire to try new things, they might miss out on exactly what would help them grow.

**What is important for parents in this context?** They want their children to be supported and prepared as best as possible for the future. At the same time, their children should have fun and ideally not even realize they are learning. However, finding suitable leisure activities for their children is often **very tedious** for them: They first need to know **which** institutions exist, then search through their websites – and in the end, hope that the offering **truly matches their children’s interests and is of high quality**.

**The biggest problem:** Especially **younger** children (in primary school) cannot research on their own what is available in their area. They depend on their parents – and if parents make the wrong choice, motivation is quickly lost. For older children, too, it is difficult, much like for parents, to navigate the abundance of institutions and offerings and discover the right fit.

## The Challenge

**This is exactly where the Challenge comes in:** The background described above also affects families in Heilbronn. As *aim*, we are an institution that offers such leisure activities for children and adolescents on our website. We also know that many other institutions in COSMOS HN have such offerings on their websites. Therefore, we want a **digital space** where offers for children and adolescents can be found **in one place**. And perhaps even more than that: It could also provide **guidance** and **advice** for selecting activities or offer the possibility to track the development of one’s own interests or the interests of children over time. At the same time, this should help COSMOS HN become even more accessible to everyone in Heilbronn.

Specifically, we are looking for a prototype for a digital application that consolidates the offerings in a digital application while providing an entry point for every family member. How can this become a place that caters to the interests of children, gives families a reason to keep coming back, and provides us, as an institution, with insights into which topics, activities, and interests that families in Heilbronn are looking for?

**How would you design such a digital application?**

## Your goal

**Your goal should be the prototype of a digital application that consolidates and presents various learning and leisure offerings for families in Heilbronn.**

The form of the digital application is up to you. From our side, it doesn’t have to be a web app or website – rather, a prototype in the form you consider most suitable for the target group, the topic, and the requirements. You are also allowed to use AI for processing the Challenge, e.g., for vibe coding, etc. What’s important to us is that your design **decisions are based on verifiable facts** and are **transparent** to us. If code is created, it’s important to us that the code is transparent. Pay attention, for example, to good code structure.

## Requirements for the prototype

- **Target audience:** This prototype should be both **child-friendly** and **appealing to adults**. The target audience consists of children and adolescents who want to participate in courses or events, and parents who are looking for courses or events for their children. One way to implement this could be, for example, a selection right at the beginning ("Who are you looking for? – For me / For my child"), after which the interface adapts to the respective group. However, we are also happy to be surprised by the great ideas you develop.
- **Data presentation:** It is important to us that you do not simply put the data into a basic list, but present it in an **appealing, innovative, creative, and target-group-appropriate** way. The result can certainly be much more than a classic event calendar. Keep in mind during development that we want family members to enjoy using the application and return to it regularly. We are excited to see what ideas you have for presenting the offerings.
- **Spatial focus:** We are aware that there are many institutions in Heilbronn offering learning and leisure activities. Therefore, for this Challenge and the development of the prototype, we want you to focus on the following institutions: **aim, experimenta, Haus der Familie and IPAI**. A list with links to these institutions and their offered events (events, courses, etc.) can be found further below in the README.
- **Maintenance of the application:** It is important to us that the maintenance effort for the application is **as low as possible**. How can the application keep itself as up-to-date as possible? What is necessary for maintaining the application? Note that this should ideally be **manageable by a person without a technical/IT background**.
- **Thematic focus:** Just like the spatial offerings, the thematic offerings in the Heilbronn area are huge. Therefore, for the prototyping, you should primarily focus on offerings (courses and events) related to the topics of **AI, coding, and gaming**.
- **Scalability:** For the Challenge, you should limit yourselves to the institutions and topics mentioned above. However, please ensure that your digital tool can be **easily extended** to include additional institutions and topics. How do you design such scalability? For example, does your tool read a file containing the links to the institutions? Can this extension **be done by a person without a strong technical/IT background**?
- **Functionalities**: The application should provide both a **good overview** and a **search function** for the target audience. Beyond that, we’d love to be surprised by your ideas, especially regarding the features your tool offers and how it presents the offerings.

## Possible work packages

### Package A: Surface Design

The core question of this package is: How should the interface look?

The different target groups (children and adolescents, parents) have different needs for an interface and varying levels of experience with user interfaces. Research and consider:

- What needs to be considered when designing an interface for children and adolescents? For example, would it make sense to differentiate the application further by age?
- What functionality must this interface provide so that children and adolescents can use it mostly independently?
- How can an interface be used by both children, adolescents and adults? Is a child-friendly interface design also appealing to adults?
- What must already be considered regarding data privacy in interface design? (See Package E)

Please consider the following:

- Children can read and write really well only from around the age of 8. Therefore, it is helpful if the interface uses the simplest possible words and keeps sentences short. A larger, sans-serif font could also support children in reading independently. Perhaps there could be a way for children to compose their sentences using images or word selection. We are excited to see what ideas you come up with.
- Which metaphors and icons are meaningful to use?
- Underage users should not be able to register themselves for events. Perhaps a feature that allows children to easily show a found offer to their parents so that they can register the child would be useful.
- Here are a few initial starting points for your research:
    - a) <https://www.machbar.de/insights/websites-und-apps-fuer-kinder/>
    - b) <https://serwiss.bib.hs-hannover.de/frontdoor/deliver/index/docId/3682/file/reichert2025-bachelorarbeit.pdf>
    - c) <https://ico.org.uk/for-organisations/uk-gdpr-guidance-and-resources/childrens-information/childrens-code-guidance-and-resources/age-appropriate-design-a-code-of-practice-for-online-services/>
    - d) <https://5rightsfoundation.com/wp-content/uploads/2024/09/CRbD_report-FINAL-Online-2.pdf>
    - e) <https://www.nngroup.com/articles/childrens-websites-usability-issues/>
    - f) Of course, the GDPR, Digital Services Act, and EU AI Act also apply.
    - g) For example, research the OECD Recommendation of the Council on Children in the Digital Environment.
- Don’t forget to consider and integrate digital accessibility.

### Package B: Data Input and Maintenance

The core questions of this package are: How does the interface receive the data? How is the data kept up to date? How can the data be updated or expanded independently?

Consider how data maintenance can be automated or at least semi-automated, e.g., by directly importing offers from the institutions' websites. As part of the challenge, demonstrate how such automation could work. This will create a foundation that can later be implemented in coordination with the various institutions.

- Are there already technical interfaces available for automatically retrieving event and course data, such as programming interfaces (APIs), automatically updated lists of new content (RSS feeds), or digital calendars (iCalendar) for transferring event dates? Alternatively, can the data be provided as tables or files, e.g., in CSV or JSON format? Is it permissible to extract data from the websites?
- Which data is meaningful to extract from the websites?
- Where is human oversight still necessary?
- How can new institutions or topics be easily added? Keyword: scalability.

Note that within the scope of the challenge, the focus is on the offerings of **aim, experimenta, Haus der Familie, and IPAI** (please refer to the links provided below for these).

### Package C: Data Presentation

The core question of this package is: How can the data you collect be presented in a meaningful and appealing way?

Research and consider how the various offerings can be presented visually. Ensure that an overview function is included and that scalability remains possible in the long term.

- What information about the offerings should be presented to users?
- How should the individual data types be displayed?
- How can you provide an overview that might be more innovative than a list or a classic event calendar?

### Package D: Search Functionality

The core questions of this package are: How should users be able to search for offerings? What parameters can support the search?

The platform should include multiple themes, and users should be able to search for them.

- How can a search feature be designed to be child-friendly?
- How can children and adolescents discover offerings in a playful way (e.g., using a Vision Board), even if they don’t yet know exactly what interests them?
- What parameters can support a search or be helpful for a filtering function? For example, it should be possible to search specifically by themes (AI, coding, gaming), age groups, dates, or event types (courses, workshops, events) and filter the offerings accordingly.

### Package E: Data Privacy for Children and Adolescents

The core question of this package is: What data is absolutely necessary? How can an interface be designed to be attractive and motivating, ideally without storing any data?

Since the application will be used by children and adolescents, protecting their personal data is especially important. This is even more critical if you incorporate child-friendly design elements such as gamification features (points, badges, levels). Therefore, consider data privacy from the very beginning of prototype development.

Research and consider:

- **Data Requirements:** What data does the application truly need? Can search and filtering functions be used without a user account?
- **Distinguishing Between Children and Adolescents:** Children and adolescents have different needs, and different legal rules apply. Under the GDPR, in Germany, adolescents can only consent to data processing from the age of 16; for younger users, parental consent is required. **Consider what this means for your application**.
- **Registration:** For children, usage without registration is ideal (e.g., incognito or guest mode), where no data is permanently stored, and favorites or search histories disappear after closing the session. For parents, an account may be useful (e.g., to save offers). If children need profiles, consider data-minimizing solutions, such as: A parent account with child sub-profiles. Registration without an email address, using fantasy names and picture passwords (e.g., animal symbols).
- **Consent and Comprehensibility:** When is consent required, and when must parents be involved? How can you explain data privacy in a child-friendly way?
- **Location and Interests:** How can suitable offers be found without storing exact home addresses or permanent interest profiles?
- **Gamification:** How can playful elements be integrated without collecting excessive data? Ensure they are motivating without creating pressure, e.g., avoid leaderboards with real names or rewards for daily logins.
- **AI and Chatbots:** If you integrate a chatbot or other AI application, special requirements apply for children. Children have specific rights in the digital world, including protection, participation, and age-appropriate information. For AI usage, this means:
    - It must be clearly recognizable that users are interacting with an AI, not a human.
    - Responses should be age-appropriate, with protection against inappropriate content.
    - Many AI providers restrict usage by age in their terms of service – **check this for the service you use.**
    - Children should not need to provide personal details in chats.
- **AI and External Services:** What data is shared with third-party providers? How can you prevent unnecessary sharing of children’s personal data? How can you scan children’s inputs (e.g., name, age, address) and remove such details before sending requests to the AI?
- **Security and Deletion:** Who has access to the data? How is it protected, and when is it deleted?

## What is Bonus?

If you would also like to consider the following aspects or incorporate them into your prototypes, we would be happy, but it is not a requirement for us.

- **Notifications:** A feature that notifies users (e.g., via email) as soon as something they searched for is not found in the current offerings. Alternatively, such search queries could be collected in an overview in the backend. This would make it visible what users are searching for and where offers are still missing. Additionally, a "wish list" feature could be considered, allowing users to directly communicate which offers they would like to see. Search queries and wishes should be recorded anonymously.
- **Guidance:** A feature that allows users to roughly specify what they are looking for and then receive suggestions tailored to their interests or needs. For example, an AI assistant that users can interact with. Users could describe in their own words what they are looking for, their interests, or what they would like to learn. The AI assistant could ask follow-up questions if needed and suggest suitable offers.
- **Reach and Accessibility:** How can the prototype be made known to the entire population of Heilbronn, regardless of how close they live to the education campus or which social group their family[^1] belongs to? Could this lead to additional requirements for the prototype's design? Possible solutions include: Multilingual support and content in simple language, mobile-friendly design and no registration required, a "Share" function to send offers via messenger to friends or other parents, good visibility in search engines.
- **Distance Calculation:** A feature that shows users how far an offer is from their home or school. OpenStreetMap could be used for this purpose. This function could also be useful for institutions, e.g., to visualize the spatial distribution of offers. Especially when expanding to all of Heilbronn, this could create an overall picture of the city, highlighting areas where offers are missing. Feel free to develop your own innovative approaches here.
- **Expanding the Target Group:** We offer programs not only for children and adolescents but also for parents and educational professionals in daycare, after-school care, or schools. These groups should also be able to search for offers tailored to their needs.

[^1]: It is scientifically proven that the educational success of children and adolescents is strongly determined by their family environment. Currently, the offers from institutions primarily reach children and adolescents from families with a high awareness of educational support for their children and/or where the parents themselves are well-educated.

    The goal of these institutional offers is to strengthen the education of children and adolescents, especially for those who, for example, cannot afford courses at other educational institutions. The educational offers from these institutions are (mostly) free of charge, ensuring that everyone can access them.

## What characterizes a strong solution?

A strong solution is characterized by transparent code and the fulfillment of all requirements. For example, this includes ensuring scalability. A solution is particularly compelling if data maintenance can be automated or at least semi-automated. However, if a solution stands out due to a highly innovative and creative approach to surface design, this aspect may carry less weight. Additionally, we prioritize design that aligns with the target audience and presents offers in an appealing way, going beyond a traditional event calendar.

## What We Offer

An excerpt from the list of institutions in COSMOS HN:

- **Institution:** Aim – Akademie für Innovative Bildung und Management
    - **General Website:** <https://www.aim-akademie.org/>
    - **Relevant Subpages:**
        - Lernen in Ferien & Freizeit: <https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_sonderrubrik=1264>
        - Digitale Bildung: <https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_sonderrubrik=1277>
        - Juniorakademie: <https://www.aim-akademie.org/kurse/suche?clearallkatfilter=true&suchesetzen=true&kfs_stichwort_schlagwort=juniorakademie&kfs_sonderrubrik=-1&kfs_ort_select=-1&kfs_kennz=&kfs_veranartselect=-1&kfs_aussenst_select=-1&kfs_kursbereich=-1&kfs_veranartselect=-1&kfs_beginn_dat1=&kfs_beginn_dat2=>
        - Coding: <https://www.aim-akademie.org/kurse?kathaupt=18&suchesetzen=false&kfs_kursbereich=1278&kfs_sonderrubrik=1277>
- **Institution:** experimenta
    - **General Website:** <https://www.experimenta.science/>
    - **Relevant Subpages:**
        - <https://www.experimenta.science/lernen/>
- **Institution:** Haus der Familie
    - **General Website:** <https://hdf-hn.de/>
    - **Relevant Subpages:**
        - <https://hdf-hn.de/kinder-jugendliche/>
        - <https://hdf-hn.de/angebote/digitale-familienwerkstatt/>
- **Institution:** IPAI Foundation
    - **General Website:** (empty in the source)
    - **Relevant Subpages:**
        - <https://ipai-foundation.ai/#events>
