/* ============================================================
   Talkify — Seed Data
   Contacts, groups, and pre-seeded conversations for demo mode
   ============================================================ */

// ── Contacts ────────────────────────────────────────────────
export const contacts = [
  {
    id: 'c1',
    name: 'Aarav Sharma',
    initials: 'AS',
    online: true,
    lastSeen: 'Online',
    avatarColor: '#1a3a2a',
    personality: [
      "That sounds awesome!",
      "I was thinking the same thing 😊",
      "Let's make it happen!",
      "Sure, I'm up for it.",
      "Tell me more about that.",
      "Haha, love it!",
      "Interesting perspective 🤔",
    ],
  },
  {
    id: 'c2',
    name: 'Mei Lin',
    initials: 'ML',
    online: true,
    lastSeen: 'Online',
    avatarColor: '#2a1a3a',
    personality: [
      "Got it, thanks for sharing!",
      "That's a great idea 💡",
      "I'll look into it.",
      "Perfect, sounds good to me.",
      "Can we discuss this further?",
      "Noted! Let's follow up later.",
      "On it! 🚀",
    ],
  },
  {
    id: 'c3',
    name: 'Jordan Blake',
    initials: 'JB',
    online: false,
    lastSeen: '2 hours ago',
    avatarColor: '#3a2a1a',
    personality: [
      "Cool, I'll check it out.",
      "Not sure about that, let me think…",
      "Yeah, makes sense.",
      "LOL 😂",
      "Can you send me the link?",
      "I agree with you on this.",
      "Let's catch up later!",
    ],
  },
  {
    id: 'c4',
    name: 'Priya Patel',
    initials: 'PP',
    online: true,
    lastSeen: 'Online',
    avatarColor: '#1a2a3a',
    personality: [
      "Absolutely! Count me in.",
      "This is really helpful, thanks!",
      "Let me know how it goes 😊",
      "I was just about to say that!",
      "Great work on this!",
      "Sounds like a plan 👍",
      "We should do this more often.",
    ],
  },
  {
    id: 'c5',
    name: 'Lucas Rivera',
    initials: 'LR',
    online: false,
    lastSeen: '30 min ago',
    avatarColor: '#3a1a2a',
    personality: [
      "Hmm, I have a different take on this.",
      "Let me get back to you.",
      "That's wild! 🔥",
      "Okay, I can work with that.",
      "Not bad, not bad at all.",
      "Send me the details?",
      "Roger that! ✅",
    ],
  },
  {
    id: 'c6',
    name: 'Sofia Chen',
    initials: 'SC',
    online: true,
    lastSeen: 'Online',
    avatarColor: '#2a3a1a',
    personality: [
      "Love this idea!",
      "I'm on board, let's do it.",
      "Thanks for the update!",
      "Can we sync on this tomorrow?",
      "Nice! Keep me posted 💬",
      "Already done! 😉",
      "Totally agree.",
    ],
  },
];

// ── Groups ──────────────────────────────────────────────────
export const groups = [
  {
    id: 'g1',
    name: 'Design Team',
    isGroup: true,
    members: ['c1', 'c2', 'c4', 'c6'],
    initials: 'DT',
    avatarColor: '#1f3329',
  },
  {
    id: 'g2',
    name: 'Weekend Plans',
    isGroup: true,
    members: ['c1', 'c3', 'c5'],
    initials: 'WP',
    avatarColor: '#33291f',
  },
];

// ── Helper to get contact by id ─────────────────────────────
export function getContact(id) {
  return contacts.find((c) => c.id === id) || null;
}

// ── Pre-seeded conversations ────────────────────────────────
let _id = 0;
const msg = (text, isSent, minsAgo = 0, senderId = null) => ({
  id: ++_id,
  text,
  isSent,
  senderId,
  timestamp: new Date(Date.now() - minsAgo * 60000).toISOString(),
});

export const seedConversations = {
  c1: [
    msg("Hey Aarav! How's the project going?", true, 45),
    msg("Going well! Almost done with the frontend.", false, 43, 'c1'),
    msg("That's great, need any help?", true, 40),
    msg("I might need your input on the color scheme 😊", false, 38, 'c1'),
  ],
  c2: [
    msg("Hi Mei, did you see the design mockups?", true, 120),
    msg("Yes! They look amazing 💡", false, 118, 'c2'),
    msg("Thanks! Let me know if you have feedback.", true, 115),
  ],
  c3: [
    msg("Jordan, are you coming to the meetup?", true, 200),
    msg("Not sure about that, let me think…", false, 195, 'c3'),
  ],
  c4: [
    msg("Priya, the deployment is live! 🚀", true, 30),
    msg("Absolutely! Count me in for the review.", false, 28, 'c4'),
    msg("Perfect, let's schedule it for tomorrow.", true, 25),
    msg("Sounds like a plan 👍", false, 23, 'c4'),
  ],
  c5: [
    msg("Hey Lucas, got the API docs?", true, 300),
    msg("Let me get back to you.", false, 295, 'c5'),
  ],
  c6: [
    msg("Sofia, welcome to the team!", true, 500),
    msg("Thanks for the update!", false, 498, 'c6'),
    msg("Let me know if you need anything.", true, 495),
    msg("Already done! 😉", false, 490, 'c6'),
  ],
  g1: [
    msg("Team, let's finalize the color palette today.", true, 60),
    msg("I'll prepare some options.", false, 58, 'c2'),
    msg("Sounds good, I have a few ideas too!", false, 55, 'c4'),
    msg("Love this idea!", false, 52, 'c6'),
  ],
  g2: [
    msg("Anyone up for hiking this Saturday?", true, 180),
    msg("Yeah, makes sense.", false, 175, 'c3'),
    msg("That's wild! 🔥 Count me in.", false, 170, 'c5'),
  ],
};
