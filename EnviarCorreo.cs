public Result EnviarCorreo(string mailKey, string pAsunto,string pCuerpo, string pCorreos="", string nameKey = "")

        {

            string sDe = "";

            bool bCorrecto = true;

            var resp = new Result();

            try

            {

                MailMessage mailMsg = new MailMessage();

                MailAddress mailAddress = new MailAddress(micultivoX@bayer.com,"Mi cultivo");

                SmtpClient smtpClient = new SmtpClient(“exsmtp.na.bayer.cnb”, 25);

                smtpClient.UseDefaultCredentials = true;

                smtpClient.EnableSsl = false;

                mailMsg.From = mailAddress;

                if (pCorreos.Length > 0)

                    mailMsg.To.Add(pCorreos);

                mailMsg.Priority = MailPriority.Normal;

                // Cuerpo del texto

                mailMsg.Subject = pAsunto;

                mailMsg.IsBodyHtml = true;

                //Datos del Servidor

                mailMsg.Body = pCuerpo;

                foreach (var att in Adjuntos)

                    mailMsg.Attachments.Add(att);

                if (cc.Respuesta)

                    mailMsg.CC.Add(cc.Valor);

                if (bcc.Respuesta)

                    mailMsg.Bcc.Add(bcc.Valor);

                foreach (var cta in _to)

                    mailMsg.To.Add(cta);

                foreach (var cta in _cc)

                    mailMsg.CC.Add(cta);

                foreach (var cta in _bcc)

                    mailMsg.Bcc.Add(cta);

                mailMsg.DeliveryNotificationOptions = DeliveryNotificationOptions;

 

               smtpClient.Send(mailMsg);

 

                resp.Respuesta = true;

                resp.Mensaje = "Correo enviado correctamente.";

            }

            catch (Exception ex)

            {

                resp.Respuesta = false;

                resp.Mensaje = ex.Message;

                var log = new SaveLog();

                log.Save(ex);

                bCorrecto = false;

            }

            return resp;

        }

 

EnviarCorreo("Fum-Correo", cc.Asunto, cc.Correo.Replace("#URL#", r.Dominio()))