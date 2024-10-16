# Grungle

![grungle](example.png)

Grungle is a prototype proof of concept that is currently only available in the browser.

The deck is generated at the beginning of the game. There are 7 cards of each suit with a value ranging from 1 through to 7.

The objective of the game is clear the deck of cards. Cards are picked from the deck and placed on the board. To remove cards from the board, you must use the dice values to create two cards that match in suit and value. Once you select both of these cards, they will disappear in a puff of smoke and another roll of the dice will be initiated. Get rid of the deck to win the game.

As is a continuing work in progress and proof of concept, bugs are expected. There is a known issue in which card duplication can happen. I believe this is due to the handling of cards being placed on the board. After some feedback it has become evident that the draggable nature of the cards and dice can be cumbersome for some users. This has prompted some future development goals.

---

- [ ] Remove draggable interaction and implement a select/anchor system. Anchoring the cards and dice to the cursor once selected. A secondary select deanchors and places the card/dice if appropriate
- [ ] create a unit test to get a clearer idea of the card duplication bug.
- [ ] implement fix post test

This was a fun practise project and not a serious commercial work. Therefore time/schedule will dictate my desire to rebuild in React and bring it to mobile ready with React Native.
