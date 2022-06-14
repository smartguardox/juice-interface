import axios from 'axios'

import { VeNftVariant } from 'models/veNft/veNftVariant'
import { useQuery } from 'react-query'
import { ipfsCidUrl } from 'utils/ipfs'

import { VARIANTS_HASH } from 'constants/v2/nft/nftProject'

type VeNftMetadataResponse = {
  metadata: {
    name: string
    jbx_range: string
  }
}

export function useNFTGetVariants() {
  const hash = VARIANTS_HASH
  return useQuery(
    ['nft-variants', hash],
    async () => {
      if (!hash) {
        throw new Error('Variants hash not specified.')
      }
      const file = hash + '/characters.json'
      const url = ipfsCidUrl(file)
      const response = await axios.get(url)
      const data: Record<string, VeNftMetadataResponse> = response.data
      const variants: VeNftVariant[] = Object.entries(data).map(
        ([id, variant]) => {
          const { name, jbx_range } = variant.metadata
          const split = jbx_range.split('-')
          const tokensStakedMin = parseInt(split[0].replaceAll(',', ''))
          const tokensStakedMax =
            split.length > 1
              ? parseInt(split[1].replaceAll(',', ''))
              : undefined
          return {
            id: parseInt(id),
            name: name.replaceAll('_', ' '),
            tokensStakedMin,
            tokensStakedMax,
          }
        },
      )
      return variants
    },
    {
      enabled: !!hash,
      staleTime: 60000,
    },
  )
}
