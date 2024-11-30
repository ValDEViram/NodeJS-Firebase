import 'dotenv/config'
import webPush from 'web-push'

webPush.setVapidDetails(
  `mailto:${process.env.EMAIL_USER}`,
  process.env.PUBLIC_VAPID_KEY,
  process.env.PRIVATE_VAPID_KEY
)

export default webPush
