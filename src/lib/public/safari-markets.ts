export const safariMarkets = {
  kenya: {
    title: 'Kenya safaris',
    description:
      'Maasai Mara big cats, Amboseli elephants under Kilimanjaro, Tsavo, and the migration on the Kenyan side of the river.'
  },
  tanzania: {
    title: 'Tanzania safaris',
    description:
      'Serengeti plains, Ngorongoro Crater, Kilimanjaro, and a northern circuit paced so you are not rushing between parks.'
  },
  'kenya-tanzania': {
    title: 'Kenya and Tanzania safaris',
    description:
      'One itinerary across both countries: Maasai Mara into Serengeti, Amboseli under Kilimanjaro, then the coast if you want it.'
  }
} as const;

export function isSafariMarket(value: string): value is keyof typeof safariMarkets {
  return Object.hasOwn(safariMarkets, value);
}
