export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const isProduction = process.env.NODE_ENV === 'production'
  res.setHeader(
    'Set-Cookie',
    `token=; HttpOnly; ${isProduction ? 'Secure; ' : ''}SameSite=Strict; Path=/; Max-Age=0`
  )

  res.status(200).json({ success: true })
}
