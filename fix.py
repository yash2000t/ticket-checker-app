import base64

with open(r'd:\MY\Ticket Checker\ticket-template.jpg', 'rb') as f:
    b64 = base64.b64encode(f.read()).decode('utf-8')

with open(r'd:\MY\Ticket Checker\index.html', 'r', encoding='utf-8') as f:
    html = f.read()

start = html.find('const templateImg = new Image();')
end = html.find('}, 100);', start)

replacement = f"""const templateImg = new Image();
                        templateImg.onload = () => {{
                            const canvas = document.getElementById('ticketCanvas');
                            const ctx = canvas.getContext('2d');
                            canvas.width = templateImg.width;
                            canvas.height = templateImg.height;
                            ctx.drawImage(templateImg, 0, 0, canvas.width, canvas.height);
                            const W = canvas.width;
                            const H = canvas.height;
                            
                            const qrSize = Math.round(W * 0.610); 
                            const qrX = Math.round((W - qrSize) / 2);
                            const qrY = Math.round(H * 0.183); 
                            ctx.drawImage(qrCanvas, qrX, qrY, qrSize, qrSize);
                            
                            ctx.font = `bold ${{Math.round(W*0.040)}}px Arial, sans-serif`;
                            ctx.fillStyle = "#1e293b"; 
                            ctx.textAlign = "left";
                            const textX = Math.round(W * 0.136);
                            const textY = Math.round(H * 0.865); 
                            ctx.fillText(name.toUpperCase(), textX, textY);
                            
                            const dlBtn = document.getElementById('downloadBtn');
                            dlBtn.onclick = () => {{
                                const safeName = name.replace(/[^a-zA-Z0-9]/g, '_');
                                const safeId = training_id.replace(/[^a-zA-Z0-9]/g, '_');
                                const link = document.createElement('a');     
                                link.download = `${{safeName}}_${{safeId}}_Ticket.png`;
                                link.href = canvas.toDataURL('image/png', 1.0);
                                link.click();
                            }};
                        }};
                        templateImg.onerror = () => {{
                            Swal.fire({{
                                title: 'Template Error!',
                                text: 'Failed to load template.',
                                icon: 'error',
                                background: '#1e293b', color: '#fff'
                            }});
                        }};
                        templateImg.src = 'data:image/jpeg;base64,{b64}';
                    """

new_html = html[:start] + replacement + html[end:]

with open(r'd:\MY\Ticket Checker\index.html', 'w', encoding='utf-8') as f:
    f.write(new_html)
