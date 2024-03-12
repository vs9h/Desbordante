import { gql } from '@apollo/client';

export const GET_DATASETS_INFO = gql`
    query getDatasetsInfo($props: DatasetsQueryProps!) {
        datasets(props: $props) {
            fileID
            originalFileName
            fileFormat {
                inputFormat
                tidColumnIndex
                itemColumnIndex
                hasTid
            }
            fileSize
            createdAt
            isBuiltIn
            hasHeader
            delimiter
            fileName
            supportedPrimitives
            rowsCount
            countOfColumns
            numberOfUses
            user {
                fullName
            }
        }
    }
`;
