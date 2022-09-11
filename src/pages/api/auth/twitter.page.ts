import * as admin from 'firebase-admin'
import { NextApiRequest, NextApiResponse } from 'next'
import { firestoreAdmin } from 'utils/firebaseAdmin'

interface ApiRequest extends NextApiRequest {
  body: {
    projectId: number
    twitterUsername: string
  }
}

const handler = async (req: ApiRequest, res: NextApiResponse) => {
  try {
    const { projectId, twitterUsername } = req.body
    await firestoreAdmin.collection('twitterVerification').add({
      projectId,
      twitterUsername,
      initiatedAt: admin.firestore.FieldValue.serverTimestamp(),
    })
    return res.status(200).json({
      success: true,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ error })
  }
}

export default handler
