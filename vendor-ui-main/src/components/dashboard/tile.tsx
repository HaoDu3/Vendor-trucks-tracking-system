import { Geo } from "@/api/types";
import { Avatar, List, ListItemAvatar, ListItemButton, Typography } from "@mui/material";
import styled from 'styled-components';

interface TileProps {
    imgUrl: string,
    name: string,
    geo?: Geo,
}

const ListStyled = styled(List)`
    width: 100%;
    padding-top: 0px;
    padding-bottom: 0px;
`;

const ImageStyled = styled.img`
    width: 40px;
`;

const TextContainer = styled.div`
    padding: 10px 0;
    display: flex;
    flex-direction: column;
`;

const AddressDisplay = styled.div`
    display: flex;
    flex-direction: column;
`;

export function LocationDisplay ({geo}: {geo?: Geo}) {
    if (geo) {
        return (
            <AddressDisplay>
                <Typography component="span">{geo.full_name}</Typography>
                <Typography component="span">{geo.coordinates.lat.toFixed(4)} | {geo.coordinates.long.toFixed(4)}</Typography>
            </AddressDisplay>
        )
    }

    return <Typography component="span">-</Typography>
}

export default function Tile({imgUrl, name, geo}: TileProps) {
    return (
        <>
            <ListStyled>
                <ListItemButton>
                    <ListItemAvatar>
                        <Avatar sx={{ width: 40, height: 40 }}>
                            <ImageStyled src={imgUrl} />
                        </Avatar>
                    </ListItemAvatar>

                    <TextContainer>
                        <Typography component="span">{name}</Typography>
                        <LocationDisplay geo={geo} />
                    </TextContainer>
                </ListItemButton>
            </ListStyled>
        </>
    )
}