import { createContext } from 'react'
import {
  DEFAULT_NFT_FLAGS,
  EMPTY_NFT_COLLECTION_METADATA,
  NftRewardsData,
} from 'redux/slices/editingV2Project'

type NftRewardsContextType = {
  nftRewards: NftRewardsData
  loading: boolean | undefined
}

export const NftRewardsContext = createContext<NftRewardsContextType>({
  nftRewards: {
    CIDs: undefined,
    rewardTiers: undefined,
    postPayModal: undefined,
    collectionMetadata: EMPTY_NFT_COLLECTION_METADATA,
    flags: DEFAULT_NFT_FLAGS,
  },
  loading: false,
})
