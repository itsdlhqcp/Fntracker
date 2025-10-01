// import React, { useEffect, useState, useCallback } from "react";

// const logoService = {
//   async getAssetLogo(symbol, exchange = 'NSE') {
//     const url = `https://api.finshots.news/v1/portfolio-mgr/api/asset/logos?symbol=${symbol}&exchange=${exchange}`;
    
//     try {
//       const response = await fetch(url, {
//         method: 'GET',
//         headers: {
//           'Authorization': 'Bearer eyJhbGciOiJSUzI1NiIsImtpZCI6IjkyN2I4ZmI2N2JiYWQ3NzQ0NWU1ZmVhNGM3MWFhOTg0NmQ3ZGRkMDEiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiIzNzkwMTgzMTQ5NDctNDFkcjhuZDlxZWk1am9qcDkwNHJidXY3MjZkOHN2ZHQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiIzNzkwMTgzMTQ5NDctNDFkcjhuZDlxZWk1am9qcDkwNHJidXY3MjZkOHN2ZHQuYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMDU5NDA2MDU0MTc4OTAwODkwODYiLCJlbWFpbCI6ImRpbGhhcXVlY3BAZ21haWwuY29tIiwiZW1haWxfdmVyaWZpZWQiOnRydWUsImF0X2hhc2giOiJDVF9OSFdlOEFZbE1NSHR6MmtxZHBRIiwibmFtZSI6IkRpbGhhcXVlIEFoZW1tZWQgQyBQIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FDZzhvY0tsWFJ2cWhKLXZnNjNFdW8wZzE0a2lOMERuTE05UkQ2ZkN3OFpjbW1jSDZNTjhUM0k9czk2LWMiLCJnaXZlbl9uYW1lIjoiRGlsaGFxdWUiLCJmYW1pbHlfbmFtZSI6IkFoZW1tZWQgQyBQIiwiaWF0IjoxNzU4NzkwOTYzLCJleHAiOjE3NTg3OTQ1NjN9.Rw5c2PLqx7qjX5tDcpfKPDDd38Q7esYhhF0LW7mQkdS_AbZb-PgNsj-UZfjIbBIlYCnlMDDAI25E9T7X12-_SFVdJ-v0E3460SOnu2VTB4R5lmmvWW_SVC8WFSs4iNIJgLs4OxACv79HO8t50qqrhJ1uNFv14IbG3NR13theUqOY8T1LmhMc6JR9X1bFPGCXsuhJYTO4OiKUrzDJl8BnUm49HYcuLu7BMAan0CV-DfAVMull2Fzcwh1Mw3OddL7VFLLZF0dl7W-l8DeuHJgQo1RQbu5sH1uq4fPCsy9lpQHDCX1zu2ByYg8BA8OoDAWXVvjF-VItUPydcBxkXNG2_w',
//           'Content-Type': 'application/json',
//           'Accept': '*/*'
//         }
//       });

//       if (!response.ok) {
//         throw new Error(`HTTP ${response.status}: ${response.statusText}`);
//       }

//       const blob = await response.blob();
      
//       if (blob.size === 0) {
//         throw new Error('Received empty response');
//       }
      
//       return blob;
      
//     } catch (error) {
//       // Fallback to demo logo
//       const svgContent = `
//         <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
//           <rect width="100" height="100" fill="#1f77b4" rx="10"/>
//           <text x="50" y="35" font-family="Arial" font-size="12" fill="white" text-anchor="middle">${symbol}</text>
//           <text x="50" y="65" font-family="Arial" font-size="8" fill="#ccc" text-anchor="middle">Demo Logo</text>
//         </svg>
//       `;
      
//       return new Blob([svgContent], { type: 'image/svg+xml' });
//     }
//   }
// };

// const AssetLogoViewer = ({ logoBlob: initialLogoBlob }) => {
//   const [logoBlob, setLogoBlob] = useState(initialLogoBlob);
//   const [logoUrl, setLogoUrl] = useState(null);
//   const [isSvg, setIsSvg] = useState(false);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [symbol, setSymbol] = useState('HDFCBANK');
//   const [exchange, setExchange] = useState('NSE');

//   const processLogoBlob = useCallback(async (blob) => {
//     if (!blob) return;

//     try {
//       const type = blob.type;

//       if (type === "image/svg+xml") {
//         let svgText = await blob.text();
        
//         // Fix SVG dimensions if missing
//         if (!svgText.includes("width") && !svgText.includes("height")) {
//           svgText = svgText.replace("<svg", '<svg width="100%" height="100%"');
//         }
        
//         // Add viewBox if missing
//         if (!svgText.includes("viewBox") && svgText.includes("width") && svgText.includes("height")) {
//           const widthMatch = svgText.match(/width="([^"]*)"/) || svgText.match(/width=(\d+)/);
//           const heightMatch = svgText.match(/height="([^"]*)"/) || svgText.match(/height=(\d+)/);
          
//           if (widthMatch && heightMatch) {
//             const numericWidth = parseFloat(widthMatch[1]) || 100;
//             const numericHeight = parseFloat(heightMatch[1]) || 100;
//             svgText = svgText.replace("<svg", `<svg viewBox="0 0 ${numericWidth} ${numericHeight}"`);
//           }
//         }
        
//         setLogoUrl(svgText);
//         setIsSvg(true);
//       } else {
//         const objectUrl = URL.createObjectURL(blob);
//         setLogoUrl(objectUrl);
//         setIsSvg(false);
//       }
//     } catch (err) {
//       setError(`Failed to process logo: ${err.message}`);
//     }
//   }, []);

//   const fetchLogo = async () => {
//     try {
//       setError(null);
//       setLoading(true);
      
//       if (!symbol?.trim()) {
//         throw new Error('Please enter a valid symbol');
//       }
      
//       const blob = await logoService.getAssetLogo(symbol.trim(), exchange);
//       setLogoBlob(blob);
      
//     } catch (err) {
//       setLogoBlob(null);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (logoBlob) {
//       processLogoBlob(logoBlob);
//     } else {
//       setLogoUrl(null);
//       setIsSvg(false);
//     }
//   }, [logoBlob, processLogoBlob]);

//   useEffect(() => {
//     return () => {
//       if (logoUrl && !isSvg && logoUrl.startsWith('blob:')) {
//         URL.revokeObjectURL(logoUrl);
//       }
//     };
//   }, [logoUrl, isSvg]);

//   useEffect(() => {
//     if (!initialLogoBlob) {
//       fetchLogo();
//     }
//   }, []);

//   const handleImageError = () => {
//     setError('Failed to load image');
//   };

//   const clearData = () => {
//     setLogoBlob(null);
//     setLogoUrl(null);
//     setIsSvg(false);
//     setError(null);
//   };

//   if (!logoBlob && !loading) {
//     return (
//       <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
//         <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
//           Asset Logo Viewer
//         </h2>
        
//         <div style={{ 
//           marginBottom: '20px',
//           padding: '20px',
//           backgroundColor: '#f8f9fa',
//           borderRadius: '8px',
//           border: '1px solid #dee2e6'
//         }}>
//           <div style={{ marginBottom: '15px' }}>
//             <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
//               Symbol:
//             </label>
//             <input
//               type="text"
//               value={symbol}
//               onChange={(e) => setSymbol(e.target.value.toUpperCase())}
//               onKeyPress={(e) => e.key === 'Enter' && fetchLogo()}
//               placeholder="Enter symbol (e.g., HDFCBANK)"
//               style={{ 
//                 padding: '8px 12px', 
//                 width: '200px',
//                 border: '1px solid #ccc',
//                 borderRadius: '4px',
//                 fontSize: '14px'
//               }}
//             />
//           </div>
          
//           <div style={{ marginBottom: '20px' }}>
//             <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>
//               Exchange:
//             </label>
//             <select
//               value={exchange}
//               onChange={(e) => setExchange(e.target.value)}
//               style={{ 
//                 padding: '8px 12px', 
//                 width: '120px',
//                 border: '1px solid #ccc',
//                 borderRadius: '4px',
//                 fontSize: '14px'
//               }}
//             >
//               <option value="NSE">NSE</option>
//               <option value="BSE">BSE</option>
//             </select>
//           </div>
          
//           <button 
//             onClick={fetchLogo}
//             disabled={loading || !symbol?.trim()}
//             style={{ 
//               padding: '10px 20px', 
//               backgroundColor: loading || !symbol?.trim() ? '#ccc' : '#007bff',
//               color: 'white',
//               border: 'none',
//               borderRadius: '4px',
//               cursor: loading || !symbol?.trim() ? 'not-allowed' : 'pointer',
//               fontSize: '14px'
//             }}
//           >
//             {loading ? 'Loading...' : 'Fetch Logo'}
//           </button>
//         </div>

//         {error && (
//           <div style={{ 
//             backgroundColor: '#f8d7da', 
//             color: '#721c24', 
//             padding: '15px', 
//             borderRadius: '4px',
//             marginBottom: '20px',
//             border: '1px solid #f5c6cb'
//           }}>
//             <strong>Error:</strong> {error}
//           </div>
//         )}

//         {loading && (
//           <div style={{ 
//             textAlign: 'center', 
//             padding: '40px',
//             backgroundColor: '#e3f2fd',
//             borderRadius: '8px',
//             border: '1px solid #bbdefb'
//           }}>
//             <div style={{ fontSize: '16px', color: '#1976d2' }}>
//               Loading logo for {symbol} ({exchange})...
//             </div>
//             <div style={{ 
//               marginTop: '10px', 
//               width: '40px', 
//               height: '40px', 
//               border: '4px solid #f3f3f3',
//               borderTop: '4px solid #1976d2',
//               borderRadius: '50%',
//               animation: 'spin 1s linear infinite',
//               margin: '10px auto'
//             }}></div>
//           </div>
//         )}

//         <style>{`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}</style>
//       </div>
//     );
//   }

//   return (
//     <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto', fontFamily: 'Arial, sans-serif' }}>
//       <h2 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>
//         Asset Logo Viewer
//       </h2>

//       <div style={{ 
//         marginBottom: '20px',
//         padding: '15px',
//         backgroundColor: '#f8f9fa',
//         borderRadius: '8px',
//         border: '1px solid #dee2e6',
//         textAlign: 'center'
//       }}>
//         <button 
//           onClick={fetchLogo}
//           disabled={loading}
//           style={{ 
//             padding: '8px 16px', 
//             marginRight: '10px',
//             backgroundColor: loading ? '#ccc' : '#007bff',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: loading ? 'not-allowed' : 'pointer',
//             fontSize: '14px'
//           }}
//         >
//           {loading ? 'Loading...' : 'Refresh Logo'}
//         </button>
        
//         <button 
//           onClick={clearData}
//           disabled={loading}
//           style={{ 
//             padding: '8px 16px',
//             backgroundColor: '#6c757d',
//             color: 'white',
//             border: 'none',
//             borderRadius: '4px',
//             cursor: loading ? 'not-allowed' : 'pointer',
//             fontSize: '14px'
//           }}
//         >
//           Clear
//         </button>
//       </div>

//       {error && (
//         <div style={{ 
//           backgroundColor: '#f8d7da', 
//           color: '#721c24', 
//           padding: '15px', 
//           borderRadius: '4px',
//           marginBottom: '20px',
//           border: '1px solid #f5c6cb'
//         }}>
//           <strong>Error:</strong> {error}
//         </div>
//       )}

//       <div
//         style={{
//           width: "200px",
//           height: "200px",
//           border: "1px solid #ccc",
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "center",
//           background: "#fafafa",
//           margin: "0 auto",
//           borderRadius: "8px"
//         }}
//       >
//         {loading ? (
//           <div style={{ textAlign: 'center' }}>
//             <div style={{ 
//               width: '30px', 
//               height: '30px', 
//               border: '3px solid #f3f3f3',
//               borderTop: '3px solid #007bff',
//               borderRadius: '50%',
//               animation: 'spin 1s linear infinite',
//               margin: '0 auto 10px'
//             }}></div>
//             <div style={{ fontSize: '12px', color: '#666' }}>Loading...</div>
//           </div>
//         ) : logoUrl ? (
//           <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
//             {isSvg ? (
//               <div style={{ 
//                 width: "90%", 
//                 height: "90%",
//                 display: 'flex',
//                 alignItems: 'center',
//                 justifyContent: 'center'
//               }}>
//                 <div
//                   dangerouslySetInnerHTML={{ __html: logoUrl }}
//                   style={{ 
//                     width: "100%", 
//                     height: "100%",
//                     display: 'flex',
//                     alignItems: 'center',
//                     justifyContent: 'center'
//                   }}
//                 />
//               </div>
//             ) : (
//               <img
//                 src={logoUrl}
//                 alt="Asset logo"
//                 style={{ 
//                   maxWidth: "90%", 
//                   maxHeight: "90%", 
//                   objectFit: "contain"
//                 }}
//                 onError={handleImageError}
//               />
//             )}
//           </div>
//         ) : (
//           <p style={{ color: '#666', fontSize: '14px' }}>No logo available</p>
//         )}
//       </div>

//       {logoUrl && (
//         <div style={{ 
//           textAlign: 'center',
//           marginTop: '15px', 
//           fontSize: '12px', 
//           color: '#666'
//         }}>
//           <div><strong>Symbol:</strong> {symbol} ({exchange})</div>
//           <div><strong>Type:</strong> {isSvg ? 'SVG' : 'Image'}</div>
//           {logoBlob && <div><strong>Size:</strong> {logoBlob.size} bytes</div>}
//         </div>
//       )}

//       <style>{`
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AssetLogoViewer;
