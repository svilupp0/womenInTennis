// API route per cercare campi da tennis usando Google Places API (New)
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { latitude, longitude, radius = 15000 } = req.body

  // Validazione più robusta di latitude e longitude
  const lat = parseFloat(latitude)
  const lng = parseFloat(longitude)
  const radiusNum = parseFloat(radius)

  if (!latitude || !longitude || isNaN(lat) || isNaN(lng)) {
    return res.status(400).json({ error: 'Valid latitude and longitude are required' })
  }

  if (lat < -90 || lat > 90) {
    return res.status(400).json({ error: 'Latitude must be between -90 and 90' })
  }

  if (lng < -180 || lng > 180) {
    return res.status(400).json({ error: 'Longitude must be between -180 and 180' })
  }

  if (isNaN(radiusNum) || radiusNum <= 0 || radiusNum > 50000) {
    return res.status(400).json({ error: 'Radius must be a valid number between 1 and 50000 meters' })
  }

  try {
    console.log(`Searching for sports facilities near lat: ${lat}, lng: ${lng}, radius: ${radiusNum}m`)
    
    const response = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_MAPS_API_KEY,
        'X-Goog-FieldMask': 'places.displayName.text,places.formattedAddress,places.location,places.nationalPhoneNumber'
      },
      body: JSON.stringify({
        includedTypes: ['sports_complex', 'sports_club', 'stadium'],
        maxResultCount: 20,
        locationRestriction: {
          circle: {
            center: {
              latitude: lat,
              longitude: lng
            },
            radius: radiusNum
          }
        }
      })
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Google Places API error: ${response.status} - ${errorText}`)
      throw new Error(`Google Places API error: ${response.status}`)
    }

    const data = await response.json()
    console.log(`Found ${data.places?.length || 0} places`)
    
    // Log first place for debugging
    if (data.places && data.places.length > 0) {
      console.log('Sample place:', JSON.stringify(data.places[0], null, 2))
    }
    
    // Restituisci solo i dati necessari al client
    res.status(200).json({
      places: data.places || [],
      success: true
    })

  } catch (error) {
    console.error('Error searching tennis courts:', error)
    res.status(500).json({ 
      error: 'Failed to search tennis courts',
      success: false 
    })
  }
}