# Learning Guide with a talking mascot (working title)

*   **Author:** ikodo0
*   **Status:** Draft
*   **Date:** 2026-11-13

--------------------------------------------------------------------------------

## Overview

A web app that helps families in Heilbronn find courses and events for children.
It answers the aim "Learning Guide" challenge.

The child sees a mascot in the centre of the screen. The mascot speaks, asks
what the child enjoys and shows four pictures to choose from. The child answers
by voice or by tapping a picture. After a few turns the mascot shows events that
fit, and the child marks the ones they like.

A parent signs in with a Google account and sends the child an invite link.
Events the child liked in that session appear in the parent's account, with one
broad interest theme. The parent opens the institution's own page to register.
A child who opens the site without an invite gets the same conversation, and
nothing is saved.

Behind the app, an aggregator collects the offers of aim, experimenta, Haus der
Familie and IPAI, sorts them into categories and refreshes them on a schedule.
The institutions get an anonymous view of which topics children chose and which
wishes had no matching offer.

## The Problem

Heilbronn has many learning and leisure offers for children, and each
institution publishes them on its own website. Three groups lose out:

*   **Children**, above all those in primary school, cannot research offers.
    The websites are written for adults, and a child under about 8 cannot read
    them. The child depends on what a parent happens to find.
*   **Parents** have to know which institutions exist, read each site and guess
    whether an offer fits their child. A wrong guess costs the child's
    motivation. Families with less time or less knowledge of the education
    system find the fewest offers, although most offers are free.
*   **Institutions** see who registers. They do not see what children wanted and
    could not find.

The proposed solution moves the first step to the child. The child tells a
mascot what they like, in speech and pictures. The parent receives a short list
the child already chose, and decides. The institutions receive counts of what
was asked for.

## Goals

*   A child in the target age band gets from opening the link to at least one
    fitting event without reading or typing anything. Voice and the four-picture
    choices are each enough alone.
*   The mascot says in its first sentence that it is a computer program and not
    a person.
*   A parent can sign in with Google, create an invite link, and later see the
    events the child liked and one interest theme. Each event links to the
    institution's registration page.
*   A child without an invite can hold the same conversation. When the tab
    closes, nothing about that session remains on the server.
*   The catalogue holds the current AI, coding and gaming offers of the four
    named institutions in one format: title, short child-level description,
    category, age range, date, place, price, source link.
*   The catalogue refreshes without a developer. Adding a fifth institution
    means adding one entry to a source list that a non-technical person can
    edit.
*   Parents can browse and search the whole catalogue by topic, age, date and
    type of offer, without talking to the mascot.
*   Institutions can see anonymous counts: topics chosen, events liked, and
    wishes that matched no offer.

## Non-Goals

*   Accounts, passwords or sign-in for children.
*   Registration or payment inside the app. Minors must not register themselves;
    the parent registers on the institution's site.
*   Storing audio, or storing what the child said.
*   Points for daily visits, streaks, or leaderboards.
*   Covering all of Heilbronn or all topics in the prototype. The design only
    has to make that extension cheap.
*   A native mobile app.
*   A full legal compliance package. The design follows the README's
    data-minimising defaults; it does not include legal documents.

## Open Questions

*   **Speech-output model**: Mistral is chosen for speech recognition and for
    the dialogue. The model that gives the mascot a playful voice is not chosen.
    It must sound natural in the demo language and start speaking fast enough
    for a child to stay engaged.
*   **Demo language**: German, English, or both. The audience is families in
    Heilbronn; the judges' brief is in English.
*   **Age band**: the draft assumes 6 to 12. Teenagers need a different tone and
    probably no mascot.
*   **What the parent sees**: the draft assumes only events the child marked as
    liked, plus one theme. An earlier idea also passed on events the child only
    mentioned. That version weakens the promise that the child controls what
    parents see.
*   **Names**: the product and the mascot have no name yet.
*   **Source access**: whether each of the four websites offers a feed or export,
    and whether reading their pages automatically is permitted.
*   **"18+" notice**: raised as an option by the author; the session advised
    against it. Not confirmed.

## Critical User Journeys (CUJs)

### CUJ 1: Parent invites child

*   **Given**: A parent has opened the site and has a Google account.
*   **When**: The parent signs in, confirms that their child's liked events may
    be saved, and creates an invite link.
*   **Then**: The parent gets a link and a QR code to open on the child's
    device. The parent's account shows the invite as waiting.

### CUJ 2: Child talks to the mascot (invited)

*   **Given**: A child opens the invite link on a phone, tablet or laptop.
*   **When**: The mascot greets the child aloud, says it is a computer helper,
    says that parents will only see events the child likes, and asks what the
    child enjoys. The child answers by voice or by tapping one of four pictures.
    After a few turns the mascot shows event cards with a picture and reads each
    one aloud. The child taps a heart on the ones they like.
*   **Then**: The liked events and one interest theme are saved to the parent's
    account. What the child said is not saved.

### CUJ 3: Parent reviews and registers

*   **Given**: The child has liked at least one event.
*   **When**: The parent opens their account.
*   **Then**: The parent sees the liked events with date, place, age range and
    price, the child's interest theme, and other events on that theme. A button
    on each event opens the institution's registration page.

### CUJ 4: Child comes alone (guest)

*   **Given**: A child opens the site without an invite link.
*   **When**: The child talks to the mascot and likes an event.
*   **Then**: The child can show the event to a parent through a share link or
    QR code that opens the event page. Closing the tab removes the session.
    The parent can sign in from that page to start saving.

### CUJ 5: Parent searches without the mascot

*   **Given**: A parent opens the catalogue.
*   **When**: The parent filters by topic, age, date or type, or types a search.
*   **Then**: Matching events from all four institutions appear in one view.

### CUJ 6: Staff adds an institution

*   **Given**: A staff member at aim with no IT background wants to add a fifth
    institution.
*   **When**: They add its name and the address of its offers page to the source
    list and start a refresh.
*   **Then**: The new offers appear in a review list with the category the
    system proposed. The staff member approves or corrects them, and they
    become visible in the app.

### CUJ 7: Institution reads demand

*   **Given**: Children have used the mascot for some weeks.
*   **When**: A staff member opens the insight view.
*   **Then**: They see counts per topic and age band, the most liked events, and
    wishes that matched no offer. No entry can be traced to a child.

--------------------------------------------------------------------------------

<!-- Provenance: Indicates initial structural drafting via EGM. -->

*Drafted with EGM*
