export const waiterBasicsCourse = {
  id: 'waiter-basics',
  title: 'Professional Waiter Basics',
  youtubeId: 'dQw4w9WgXcQ', // Mock YouTube ID
  flashcards: [
    {
      term: "Waiter's Kit (Mandatory)",
      definition: "2 black cloths, 1 lighter, waiter's friend, 2 notebooks (1 backup), R200 broken-up float, and 4 black pens."
    },
    {
      term: "30-Second Rule",
      definition: "Acknowledge guests within 30 seconds of seating with eye contact and a professional greeting."
    },
    {
      term: "Busy Protocol",
      definition: "If no host is available and it's busy, ask guests politely to wait for a host or manager."
    },
    {
      term: "Table Setup Check",
      definition: "Clean/aligned chairs, inside setup (cutlery/glasses), stable table, functional grinders, and swept floor."
    },
    {
      term: "Dish Knowledge",
      definition: "Must know ingredients, prep style, and allergens. Guessing is unacceptable; ask management if unsure."
    },
    {
      term: "Order Confirmation",
      definition: "Note and repeat every order back to the guest, confirming temperatures and special requests."
    },
    {
      term: "Service Monitoring",
      definition: "Continuously monitor tables, anticipate needs, clear plates promptly, and pace courses professionally."
    },
    {
      term: "Pre-Drops",
      definition: "Correct cutlery, serviettes, and sauces must be on the table BEFORE food arrives."
    },
    {
      term: "Communication Standard",
      definition: "No arguing or excuses. Listen, acknowledge, apologize, and escalate issues to management immediately."
    },
    {
      term: "Section Ownership",
      definition: "Fully responsible from greeting to payment. Never assume someone else will clear or check your tables."
    },
    {
      term: "Complaint Protocol",
      definition: "Take away problematic food/drink immediately to confirm attendance to concern, then inform management."
    },
    {
      term: "Order Mistakes",
      definition: "Be honest about forgotten items, apologize, rectify immediately, and inform management."
    }
  ],
  quiz: {
    questions: [
      {
        id: 1,
        question: "What are the exact items required to be in a waiter's on-floor kit at all times?",
        options: [
          { id: 'A', text: "1 black cloth, 1 lighter, a waiter's friend, 1 notebook, and 2 black pens.", feedback: "Not quite: The manual requires 2 black cloths, 2 notebooks, a broken-up R200 float, and 4 black pens." },
          { id: 'B', text: "2 black cloths, 1 lighter, a waiter's friend, 2 notebooks (1 backup), a broken-up R200 float, and 4 black pens.", feedback: "Right answer: This is the exact, complete list of items required for your on-floor kit." },
          { id: 'C', text: "2 black cloths, 2 lighters, a waiter's friend, 1 notebook, an R100 float, and 4 blue pens.", feedback: "Not quite: The manual specifies 1 lighter, 2 notebooks, an R200 float, and specifically black pens." },
          { id: 'D', text: "1 black cloth, a waiter's friend, 2 notebooks, an R200 float, and 2 black pens.", feedback: "Not quite: You must carry 2 black cloths and 4 black pens to meet the standard." }
        ],
        correctOptionId: 'B',
        hint: "Check the number of cloths and pens."
      },
      {
        id: 2,
        question: "Within what non-negotiable timeframe must newly seated guests be acknowledged?",
        options: [
          { id: 'A', text: "Within 30 seconds of seating.", feedback: "Right answer: Guests must be acknowledged within 30 seconds with eye contact and a professional greeting." },
          { id: 'B', text: "Within 1 minute of seating.", feedback: "Not quite: The mandatory standard specified in the training manual is strictly 30 seconds." },
          { id: 'C', text: "Within 2 minutes of seating.", feedback: "Not quite: Waiting 2 minutes is unacceptable and counts as ignoring guests." },
          { id: 'D', text: "Within 5 minutes of seating.", feedback: "Not quite: 5 minutes is a major service failure." }
        ],
        correctOptionId: 'A',
        hint: "It's faster than you might think."
      },
      {
        id: 3,
        question: "If no host is available and the restaurant is busy, what should a waiter do when new guests arrive?",
        options: [
          { id: 'A', text: "Ignore the guests and focus on existing tables.", feedback: "Not quite: Ignoring guests is completely unacceptable." },
          { id: 'B', text: "Immediately seat them at any available uncleaned table.", feedback: "Not quite: Seating at uncleaned tables violates Pillar 3." },
          { id: 'C', text: "Acknowledge the guests and take them to a table immediately.", feedback: "Not quite: This is only for when the restaurant is quiet." },
          { id: 'D', text: "Ask the guests politely to wait for the host or manager.", feedback: "Right answer: The manual states waiters should ask guests to wait for management when busy." }
        ],
        correctOptionId: 'D'
      },
      {
        id: 4,
        question: "What components must be correctly set up 'inside' the table before a guest is seated?",
        options: [
          { id: 'A', text: "Only the food menus and wine lists.", feedback: "Not quite: The inside setup requires physical tableware." },
          { id: 'B', text: "Glasses, cutlery, and side plates.", feedback: "Right answer: The manual specifies glasses, cutlery, and side plates for the inside setup." },
          { id: 'C', text: "Required sauces and condiments.", feedback: "Not quite: These are 'pre-drops' done right before food arrives." },
          { id: 'D', text: "Only the salt and pepper grinders.", feedback: "Not quite: Grinders must be present but they aren't the only requirement." }
        ],
        correctOptionId: 'B'
      },
      {
        id: 5,
        question: "What must you do if a guest asks about ingredients and you do not know the answer?",
        options: [
          { id: 'A', text: "Make a confident, educated guess.", feedback: "Not quite: Guessing is completely unacceptable." },
          { id: 'B', text: "Tell the guest that the recipe is a secret.", feedback: "Not quite: This violates safety standards regarding allergens." },
          { id: 'C', text: "Ask the kitchen or management before returning to the table.", feedback: "Right answer: You must ask management or the kitchen before answering." },
          { id: 'D', text: "Suggest they order a different item instead.", feedback: "Not quite: You must address the guest's inquiry directly." }
        ],
        correctOptionId: 'C'
      },
      {
        id: 6,
        question: "What is the mandatory procedure immediately after taking a table's order?",
        options: [
          { id: 'A', text: "Walk directly to the POS system and enter it immediately.", feedback: "Not quite: This increases the risk of errors." },
          { id: 'B', text: "Note and repeat the order back to the guest.", feedback: "Right answer: You must note and repeat every order back to confirm details." },
          { id: 'C', text: "Upsell a dessert and ask for payment.", feedback: "Not quite: Confirming the main order comes first." },
          { id: 'D', text: "Take the notebook to the kitchen to show the chefs.", feedback: "Not quite: Verify accuracy with the guest first." }
        ],
        correctOptionId: 'B'
      },
      {
        id: 7,
        question: "Which of the following best describes the pre-drop standard before food arrives?",
        options: [
          { id: 'A', text: "Correct cutlery, serviettes, and sauces must be present so the guest never has to ask.", feedback: "Right answer: Everything must be ready so food never arrives incomplete." },
          { id: 'B', text: "Bring the cutlery as the food is placed on the table.", feedback: "Not quite: This is too late. Tools must be present beforehand." },
          { id: 'C', text: "Cutlery is only provided if requested.", feedback: "Not quite: Basic items must be anticipated and pre-dropped." },
          { id: 'D', text: "Only sauces should be dropped off beforehand.", feedback: "Not quite: Cutlery is required to eat the food and must be pre-dropped." }
        ],
        correctOptionId: 'A'
      },
      {
        id: 8,
        question: "Under 'Ownership of Your Section', which of the following is true?",
        options: [
          { id: 'A', text: "You can assume other waiters will handle clearing if you are busy.", feedback: "Not quite: You must never assume someone else will handle your tables." },
          { id: 'B', text: "Your responsibility ends once the food is delivered.", feedback: "Not quite: You are responsible all the way to payment." },
          { id: 'C', text: "You are fully responsible for your tables from greeting to payment.", feedback: "Right answer: You have total ownership of the entire experience." },
          { id: 'D', text: "The manager is solely responsible for guest satisfaction.", feedback: "Not quite: You are responsible for preventing complaints in your section." }
        ],
        correctOptionId: 'C'
      },
      {
        id: 9,
        question: "What is the very first physical action when a guest complains about a plate or drink?",
        options: [
          { id: 'A', text: "Explain the chef's recipe to the guest.", feedback: "Not quite: Arguing or offering excuses is not permitted." },
          { id: 'B', text: "Offer a complimentary drink or dessert.", feedback: "Not quite: Immediate action is to remove the item." },
          { id: 'C', text: "Take the food plate or drink away immediately.", feedback: "Right answer: This confirms you are attending to their concerns right away." },
          { id: 'D', text: "Leave the item on the table and find a manager.", feedback: "Not quite: Leaving the item causes frustration. Take it away first." }
        ],
        correctOptionId: 'C'
      },
      {
        id: 10,
        question: "What is the correct protocol if you realize you forgot to order a guest's item?",
        options: [
          { id: 'A', text: "Blame the kitchen delay or a POS system error.", feedback: "Not quite: The manual forbids making excuses. Be honest." },
          { id: 'B', text: "Apologise honestly, rectify the mistake, and inform management.", feedback: "Right answer: Be honest, fix it immediately, and tell management." },
          { id: 'C', text: "Quietly enter the order late and avoid the table.", feedback: "Not quite: Avoiding the table damages trust. Sincere apology required." },
          { id: 'D', text: "Offer the guest a free meal without consulting a manager.", feedback: "Not quite: You must rectify it and inform management." }
        ],
        correctOptionId: 'B'
      }
    ]
  }
};
