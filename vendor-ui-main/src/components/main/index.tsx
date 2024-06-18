import { Tweet, Vendors } from '@/api/types';
import Map from '../map/index';
import { useEffect, useState } from 'react';
import Dashboard from '../dashboard';
import styled from 'styled-components';
import { websocket } from '@/api/websocket';
import { vendorsSort } from '@/helpers/utils';

interface MainProps {
    initVendors: Vendors;
}

const MainStyled = styled.main`
    display: flex;
`;

export default function Main({ initVendors }: MainProps) {
    const [vendors, setVendors] = useState(initVendors);
    const [markers, setMarkers] = useState<{[key:string]: google.maps.Marker}>({})

    const websocketUrl = process.env.NEXT_PUBLIC_VENDORS_WEBSOCKET_URL;

    useEffect(() => {
        if (websocketUrl) {
            const ws = websocket(websocketUrl);

            const connect = () => {
                console.log('connected to websocket');
            }
            ws.addEventListener('open', connect);

            const message = (ev: MessageEvent) => {
                const data: Tweet = JSON.parse(ev.data);
                console.log(data);

                setVendors(prev => {
                    const updatedItems = [...prev.Items];

                    updatedItems.forEach(vendor => {
                        if (vendor.twitterId === data.userId) {
                            vendor.tweets.push(data);
                        }
                    })

                    return {
                        Items: vendorsSort(updatedItems),
                        count: prev.count,
                        lastEvaluatedKey: prev.lastEvaluatedKey
                    }
                })
            }
            ws.addEventListener('message', message)

            return () => {
                ws.removeEventListener('open', connect);
                ws.removeEventListener('message', message);
                ws.close();
            }
        }
    })

    return (
        <MainStyled>
            
            <Dashboard 
                vendors={vendors}
                setVendors={setVendors}
            />
            <Map 
                markers={markers}
                setMarkers={setMarkers}
                vendors={vendors}
            />
        </MainStyled>
    )
}