# Learning Guide with a talking mascot (working title)

* **Author:** ikodo0
* **Date:** 2026-11-13

## Overview

A web app for families in Heilbronn, built for the aim "Learning Guide"
challenge. A child talks by voice to a mascot in the centre of the screen and
answers by tapping one of four pictures. The mascot suggests courses and events
that fit what the child says. The events come from an aggregator that collects
the offers of aim, experimenta, Haus der Familie and IPAI on AI, coding and
gaming.

A parent signs in with a Google account, creates an invite link and gives it to
the child. Events the child likes in that session are saved to the parent's
account, together with one broad interest theme. A child who opens the site
without an invite gets the same conversation, and nothing is saved.

## Analysis

The Goldfish review was not run: the author moved to drafting before the
readiness gate. The points below come from the brainstorm session and from one
research report on data protection.

* **The companion is the bonus, the aggregator is the requirement.** The
  challenge README defines a strong solution by transparent code, automated or
  semi-automated data upkeep, extension by a non-technical person, an overview
  and a search. An AI assistant is listed under "What is Bonus?". Every team
  received the same README, so a recommending chatbot alone is not original.
* **The catalogue is small.** Four institutions and three topics give perhaps a
  few dozen live offers. The conversation has to add something a filter does
  not: it works for a child who cannot read, and it produces demand data.
* **Trust and storage pull against each other.** The author wants the child to
  speak freely without fear that parents read along. A parent can very likely
  request any stored data of a young child. The promise "your parents only see
  what you choose" is true only if nothing else is stored.
* **Voice is the riskiest channel.** A child will say a name, a school or an
  address aloud, and this cannot be removed before speech recognition. The
  four-picture path must work without a microphone.
* **The parent invite doubles as consent.** Storage starts only after a parent
  has signed in and sent a link. Guest sessions store nothing. This matches the
  README's preferred design (no registration for children, parent account for
  saved offers) at no extra cost.
* **Provider terms limit the model choice.** Google's Gemini API terms forbid
  apps aimed at under-18s. Mistral allows use by minors with parental consent
  and forbids sending children's personal data.
* **The institutions are a third audience.** aim asked twice for insight into
  what young people want and what is missing. Anonymous counts of chosen topics
  and of wishes with no matching offer answer this without personal data.

## Goals vs. Non-Goals

* **In-Scope Goals:**
    * A talking mascot that a child can use without reading or typing.
    * Parent account with invite link; liked events visible to the parent.
    * Guest mode with no storage.
    * An aggregator for the four named institutions with categorised events and
      a repeatable refresh.
    * Overview and search for parents.
    * Anonymous demand view for institutions.
* **Out-of-Scope Non-Goals:**
    * Child accounts, child passwords, in-app registration for events.
    * Storing audio.
    * Leaderboards, streaks or rewards for daily visits.
    * A full legal compliance package.

## Alternatives Weighed

* **Child profile built from chats, with a child account.** Rejected by author:
  data is stored only after a parent sends an invite link, and it lives in the
  parent's account.
* **Typed chat as the main channel.** Rejected by author: young children do not
  read or write well, so the mascot speaks and the child answers by voice or by
  tapping pictures.
* **Storing conversation transcripts "for GDPR".** Rejected by author: guest
  conversations are not saved. Research found that GDPR does not require
  keeping conversation content and that stored transcripts break the trust
  promise to the child.
* **One provider (Mistral) for recognition, dialogue and speech output.**
  Rejected by author: the mascot needs a more playful voice than the Mistral
  speech model is expected to give. Mistral stays for speech recognition and
  for the dialogue; the speech-output model is still open.
* **Google Gemini API.** Rejected: its terms forbid apps directed at under-18s.
* **An "18+" notice on the site.** Not adopted in the session: it contradicts
  the challenge audience, and the parent invite covers consent. The author has
  not confirmed this.

## Key Decisions & Staging for Next Steps

* Main entry: parent signs in with Google and sends the child an invite link.
* Secondary entry: child opens the site alone; nothing is stored.
* The mascot speaks; the child answers by voice or by one of four pictures.
* Mistral handles speech recognition and the dialogue with function calls to
  the aggregator.
* The demo uses events the team aggregates from the four institutions; the
  aggregator must be able to refresh them.
* Open: mascot and product name, speech-output model, age band, demo language,
  what exactly the parent sees.
