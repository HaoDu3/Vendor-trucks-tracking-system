export interface Coordinates {
    lat: number,
    long: number
  }
  
  export interface Geo {
    coordinates: Coordinates,
    country: string,
    country_code: string,
    full_name: string,
    id: string,
    name: string,
    place_type: string,
  }
  
  export interface Tweet {
    date: string,
    geo: Geo,
    id: string,
    image?: string,
    text: string,
    userId: string,
    userName: string
  }
  
  export interface Vendor {
      name: string,
      image: string,
      updated: number,
      tweets: Tweet[],
      twitterId: string,
      created: number,
      description: string
  }
  
  export interface Vendors {
      Items: Vendor[],
      count: number,
      lastEvaluatedKey: string | null
  }
  