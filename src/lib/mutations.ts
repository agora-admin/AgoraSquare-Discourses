import { gql } from "@apollo/client";

export const REFRESH_TOKEN = gql`
    mutation RefreshToken {
        refreshToken {
        token
        expired
        }
    }
`

export const VERIFY_SIG = gql`
    mutation VerifySignature($signature: String!, $walletAddress: String!) {
        verifySignature(signature: $signature, walletAddress: $walletAddress) {
            address
            username
            token
        }
    }
`

export const PARTICIPATE = gql`
    mutation Participate($id: ID!, $email: String!) {
        participate(id: $id, email: $email) {
            id
            title
            description
            speakers {
                address
                username
                name
            }
            propId
            chainId
            prop_description
            prop_starter
            charityPercent
            initTS
            endTS
            topics
            funds {
                address
                amount
                timestamp
                txnHash
            }
            participants {
                address
                email
                twitter_handle
                timestamp
            }
        }
    }
`

export const LINK_TWITTER = gql`
    mutation LinkTwitter($twitterHandle: String!, $twitterName: String!, $imageUrl: String!) {
        linkTwitter(twitterHandle: $twitterHandle, twitter_name: $twitterName, image_url: $imageUrl) {
            twitter_handle
            address
            connected
        }
    }
`

export const FUND_UPDATE = gql`
    mutation UpdateFunding($propId: Int!, $chainId : Int!, $amount: String!, $txn: String!) {
        updateFunding(propId: $propId, chainId: $chainId, amount: $amount, txn: $txn) {
            id
            title
            description
            speakers {
                name
                username
                address
            }
            propId
            chainId
            prop_description
            prop_starter
            charityPercent
            initTS
            endTS
            topics
            funds {
                address
                amount
                timestamp
            }
            participants {
                address
                email
                twitter_handle
                timestamp
            }
        }
    }
`

export const CREATE_DISCOURSE = gql`
    mutation CreateDiscourse($discourseInput: DiscourseInput!) {
        createDiscourse(discourseInput: $discourseInput) {
            id
            title
            description
            speakers {
                name
                username
                address
                confirmed
                isTwitterHandle
            }
            propId
            chainId
            prop_description
            prop_starter
            charityPercent
            initTS
            endTS
            topics
            funds {
                address
                amount
                timestamp
                txnHash
            }
            participants {
                address
                email
                twitter_handle
                timestamp
            }
        }
    }
`

export const SET_WALLETADDRESS = gql`
    mutation SetWalletAddress($propId: Int!, $chainId: Int! ) {
        setWalletAddress(propId: $propId, chainId: $chainId) {
            id
            propId
            chainId
            speakers {
                name
                username
                address
                confirmed
                isTwitterHandle
            }
        }
    }
`

export const SPEAKER_CONFIRMATION = gql`
    mutation SpeakerConfirmation($propId: Int!, $chainId: Int!) {
        speakerConfirmation(propId: $propId, chainId: $chainId) {
            id
            propId
            chainId
            speakers {
                name
                username
                address
                confirmed
                isTwitterHandle
            }
        }
    }
`

// "slotInput": {
//     "propId": null,
//     "slots": [
//       {
//         "timestamp": null,
//         "accepted": null
//       }
//     ]
//   }

export const PROPOSE_SLOT = gql`
    mutation ProposeSlot($slotInput: SlotInput!) {
        proposeSlot(slotInput: $slotInput) {
            id
            propId
            chainId
            proposed
            proposer {
                address
                timestamp
            }
            slots {
                timestamp
                accepted
            }
        }
    }
`

export const ACCEPT_SLOT = gql`
    mutation AcceptSlot($slotInput: SlotInput!) {
        acceptSlot(slotInput: $slotInput) {
            id
            propId
            chainId
            proposed
            proposer {
                address
                timestamp
            }
        }
    }
`

export const END_MEET = gql`
    mutation EndMeet($propId: Int!, $chainId: Int!) {
        endMeet(propId: $propId, chainId: $chainId) 
    }
`

export const TERMINATE_PROPOSAL = gql`
    mutation TerminateDiscourse($propId: Int!, $chainId: Int!) {
        terminateDiscourse(propId: $propId, chainId: $chainId) 
    }
    
`

export const FUND_WITHDRAWN = gql`
    mutation FundWithdrawn($propId: Int!, $chainId: Int!) {
        fundWithdrawn(propId: $propId, chainId: $chainId) 
    }
`

export const ENTER_DISCOURSE = gql`
    mutation EnterDiscourse($propId: Int!, $chainId: Int!) {
        enterDiscourse(propId: $propId, chainId: $chainId) 
    }
`

export const RAISE_DISPUTE = gql`
    mutation Disputed($txnHash: String!, $propId: Int!, $chainId: Int!) {
        disputed(txnHash: $txnHash, propId: $propId, chainId: $chainId)
    }
`

export const TEST = gql`
    mutation Test {
        test
    }
`

export const CHECK_STREAM = gql`
    mutation CheckStream($id: ID!) {
        check(id: $id)
    }
`

export const STOP_STREAM = gql`
    mutation StopStream($id: ID!) {
        stopRec(id: $id)
    }
`