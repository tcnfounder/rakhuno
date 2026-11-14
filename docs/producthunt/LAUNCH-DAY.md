# Product Hunt launch day — 14 Nov 2026

Launch goes live at 11:01 Istanbul time and runs for 24 hours.

## Before 11:01

- [ ] Replace the first comment in the draft with the updated one below. The saved
      version still says the app is only in Ukrainian; the editor now has an English
      interface at rakhuno.com/en/invoice.
- [ ] Open the launch page once it is live and check that the link goes to
      rakhuno.com (the draft link field once showed "https://https://").

## During the day

- Reply to every comment, ideally within an hour. Early replies help the ranking.
- Share the launch link where you already have an audience, with a plain line such as
  "We launched Rakhuno on Product Hunt today — feedback welcome". Product Hunt rules
  forbid asking for upvotes, so ask for feedback, not votes.
- Do not reply from several accounts or ask friends to post set comments. Product Hunt
  detects it and can bury the launch.
- Note feature requests in one list. They are the most useful output of the day.

## First comment (updated)

> Hi Product Hunt! 👋
>
> Rakhuno is a free invoice generator for Ukrainian sole traders (FOP).
>
> Before a client pays, their accounting department usually asks for a proper Ukrainian
> invoice: IBAN, payment purpose, and the total written out in Ukrainian words. Most FOPs
> still copy an old Word file and type that by hand.
>
> Rakhuno does just this job:
> • fill in one A4 page and get a PDF in about two minutes
> • the amount in words and an NBU payment QR code are filled in for you
> • the same invoice becomes an act of completed work or a delivery note in one click
> • no account, and your details stay in your browser
>
> The editor has an English interface (rakhuno.com/en/invoice); the documents stay in
> Ukrainian, because that is what Ukrainian clients and banks accept.
>
> What would make you send your next invoice from here instead of Word?

## Reply templates

Adapt the wording to the actual comment; replies that read as copy-paste hurt more than
they help.

**Why only Ukraine?**
> Ukrainian invoices have their own rules: the total in Ukrainian words, FOP details, the
> act of completed work after payment. General invoice tools skip these, so FOPs end up
> back in Word. Going narrow lets Rakhuno get those details right.

**Is it free? How will you make money?**
> Yes, invoices and PDFs are free and need no account. Right now we're focused on making
> the invoice flow great; pricing isn't decided yet.

**Is it available in English?**
> The editor has an English interface at rakhuno.com/en/invoice, with an English hint
> next to every field. The PDF itself stays in Ukrainian, since that is what clients and
> banks in Ukraine expect.

**Where is my data stored?**
> Your seller details, clients and recent invoices are saved only in your browser and
> never sent to our server. We only receive your email (and FOP group if you choose one),
> for tax deadline reminders.

**How is this different from Invoice Ninja / invoice-generator.com?**
> Those are great general tools. Rakhuno is built for one document type: the Ukrainian
> FOP invoice. It writes the amount in Ukrainian words, adds an NBU payment QR code, and
> turns the invoice into the act or delivery note Ukrainian clients ask for next.

**Can you add [feature]?**
> Thanks, that's useful — I've added it to the list. Could you tell me a bit about when
> you'd use it? That helps decide what to build first.

**Bug report**
> Thanks for catching this! Could you share which browser/device you're on and what you
> entered? I'll look into it today.

**Generic congratulations / "nice product"**
> Thank you! If you know a Ukrainian FOP or freelancer who still makes invoices in Word,
> I'd love to hear what they think.

**What's the tech stack?**
> Next.js on Vercel. The PDF is built right in the browser, so the invoice data doesn't
> need to leave your device.
