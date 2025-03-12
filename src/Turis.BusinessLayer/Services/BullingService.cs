using System.IO.Compression;
using System.Xml;
using FatturaElettronicaAttiva;
using Microsoft.Extensions.Options;
using TinyHelpers.Extensions;
using Turis.BusinessLayer.Services.Interfaces;
using Turis.BusinessLayer.Settings;
using Turis.Common;
using Turis.Common.Models;
using Turis.Common.Sdi;
using Turis.Common.Sdi.Enum;
using Turis.DataAccessLayer;

namespace Turis.BusinessLayer.Services;

public class BullingService(ApplicationDbContext dbContext
	, IOptions<AppSettings> appSettings
	, IAliquotaIvaService aliquotaIvaService
	, ITrackingService trackingService
	, IContactService contactService) : IBullingService
{
	private readonly AppSettings appSettings = appSettings.Value;
	
	public async Task<FatturaElettronica> PrepareFatturaElettronica(FormatoTrasmissioneType formatoTrasmissione, DocumentModel documento, List<DocumentItemModel> dettagli, List<AttachmentModel> attachments = null)
	{
		if (!documento.ClientId.HasValue)
			throw new Exception();

		if (documento.ImportoBollo > 0)
		{
			var importoBollo = appSettings.ImportoBollo;
			var codiceAliquotaIvaBollo = appSettings.CodiceAliquotaIvaBollo;
			var aliquotaIva = (await aliquotaIvaService.GetAsync(codiceAliquotaIvaBollo)).Content;

			dettagli.Add(new DocumentItemModel
			{
				Code = "BOLLO",
				Description = "Spese bolli",
				Quantity = 1 * 1.0000M,
				Price = importoBollo,
				VatRate = aliquotaIva.Aliquota,
				CodiceNatura = aliquotaIva.CodiceNatura,
				RiferimentoNormativo = aliquotaIva.Description
			});
		}

		var result = new FatturaElettronica
		{
			DocumentModel = documento,
			ProgressivoInvio = "00001"
		};

		var codiceFiscalePrestatore = appSettings.CodiceFiscalePrestatore;
		var denominazionePrestatore = appSettings.DenominazionePrestatore;
		var indirizzoPrestatore = appSettings.IndirizzoPrestatore;
		var capPrestatore = appSettings.CapPrestatore;
		var comunePrestatore = appSettings.ComunePrestatore;
		var provinciaPrestatore = appSettings.ProvinciaPrestatore;

		var client = (await contactService.GetAsync(documento.ClientId.Value)).Content;

		var datiTrasmissione = new DatiTrasmissioneType
		{
			//serve solo per preparare il "buco" dove poi lato server viene popolato dal servizio
			IdTrasmittente = new IdFiscaleType
			{
				IdPaese = "IT",
				IdCodice = codiceFiscalePrestatore
			},
			ProgressivoInvio = result.ProgressivoInvio,
			FormatoTrasmissione = formatoTrasmissione,
			CodiceDestinatario = client.SdiCode,
			ContattiTrasmittente = new ContattiTrasmittenteType()
		};
		if (!client.Pec.IsNullOrEmpty())
			datiTrasmissione.PECDestinatario = client.Pec;

		var cedentePrestatore = new CedentePrestatoreType
		{
			DatiAnagrafici = new DatiAnagraficiCedenteType
			{
				IdFiscaleIVA = new IdFiscaleType
				{
					IdPaese = "IT",
					IdCodice = codiceFiscalePrestatore
				},
				CodiceFiscale = codiceFiscalePrestatore,
				Anagrafica = new AnagraficaType
				{
					Denominazione = denominazionePrestatore
				},
				RegimeFiscale = RegimeFiscaleType.RF01,
			},
			Sede = new IndirizzoType
			{
				Indirizzo = indirizzoPrestatore,
				CAP = capPrestatore,
				Comune = comunePrestatore,
				Provincia = provinciaPrestatore
			},
		};
		var cessionarioCommittente = new CessionarioCommittenteType
		{
			DatiAnagrafici = new DatiAnagraficiCessionarioType()
			{
				Anagrafica = new AnagraficaType
				{
					Denominazione = client.CompanyName
				}
			},
			Sede = new IndirizzoType
			{
				Indirizzo = client.Address,
				CAP = client.Cap,
				Comune = client.City,
				Provincia = client.RegionalCode,
				Nazione = client.StateCode
			}
		};
		if (client.TaxCode.HasValue())
		{
			cessionarioCommittente.DatiAnagrafici.IdFiscaleIVA = new IdFiscaleType
			{
				IdPaese = client.StateCode,
				IdCodice = client.TaxCode
			};
		}
		else
			cessionarioCommittente.DatiAnagrafici.CodiceFiscale = client.FiscalCode;

		var fatturaElettronicaHeader = new FatturaElettronicaHeaderType
		{
			DatiTrasmissione = datiTrasmissione,
			CedentePrestatore = cedentePrestatore,
			CessionarioCommittente = cessionarioCommittente,
			SoggettoEmittente = new SoggettoEmittenteType
			{
			}
		};

		var fatturaElettronicaBody = new FatturaElettronicaBodyType
		{
			DatiGenerali = new DatiGeneraliType
			{
			}
		};
		fatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento = new DatiGeneraliDocumentoType
		{
			Causale = ["Fattura"],
			Divisa = "EUR",
			Data = documento.Date.DateTime,
			Numero = $"{documento.Sectional}-{documento.Number}",
			ImportoTotaleDocumento = documento.Total,
			ImportoTotaleDocumentoSpecified = true,
		};
		if (documento.Type == Constants.CodiceFattura)
		{
			fatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.TipoDocumento = TipoDocumentoType.TD01;
			fatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale = ["Fattura"];
		}
		else if (documento.Type == Constants.CodiceNotaDiCredito)
		{
			fatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.TipoDocumento = TipoDocumentoType.TD04;
			fatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.Causale = ["Nota di Credito"];
		}
		if (documento.ImportoBollo > 0)
			fatturaElettronicaBody.DatiGenerali.DatiGeneraliDocumento.DatiBollo = new DatiBolloType
			{
				BolloVirtuale = BolloVirtualeType.SI,
				ImportoBollo = documento.ImportoBollo
			};

		if (client.Sex == "A")
		{
			var item = new DatiDocumentiCorrelatiType
			{
				IdDocumento = documento.DocumentRefId.ToString()
			};
			if (!documento.Cig.IsNullOrEmpty())
				item.CodiceCIG = documento.Cig;
			if (!documento.Cup.IsNullOrEmpty())
				item.CodiceCUP = documento.Cup;

			fatturaElettronicaBody.DatiGenerali.DatiOrdineAcquisto =
			[
				item
			];
		}

		fatturaElettronicaBody.DatiBeniServizi = new DatiBeniServiziType
		{
			DettaglioLinee = new DettaglioLineeType[dettagli.Count]
		};

		var index = 0;
		foreach (var dettaglio in dettagli)
		{
			var item = new DettaglioLineeType
			{
				NumeroLinea = (index + 1).ToString(),
				CodiceArticolo = new[]
				{
					new CodiceArticoloType
					{
						CodiceTipo = "INTERNO",
						CodiceValore = dettaglio.Code
					}
				},
				Descrizione = dettaglio.Description,
				Quantita = dettaglio.Quantity.ToString("N2").Replace(",", "."),
				QuantitaSpecified = true,
				PrezzoUnitario = Math.Round(dettaglio.Price, 2),
				PrezzoTotale = Math.Round(dettaglio.RowAmount, 2),
				AliquotaIVA = Math.Round(dettaglio.VatRate, 2),
				Natura = GetNaturaType(dettaglio.CodiceNatura),
				//RiferimentoAmministrazione = dettaglio.RiferimentoNormativo.SafeRead().Trim(),
				NaturaSpecified = dettaglio.VatRate == 0
			};
			if (dettaglio.DiscountPercentage > 0)
			{
				item.ScontoMaggiorazione = new ScontoMaggiorazioneType[]
				{
					new ScontoMaggiorazioneType
					{
						Percentuale = Math.Round(dettaglio.DiscountPercentage, 2),
						Importo = Math.Round(dettaglio.RowAmount, 2)
					},
				};
			}
			fatturaElettronicaBody.DatiBeniServizi.DettaglioLinee[index] = item;
			index += 1;
		}

		var castellettoIva = buildCastellettoIva(dettagli);

		decimal ivaSplitPayment = 0;

		fatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo = new DatiRiepilogoType[castellettoIva.Count()];
		var indexCastelletto = 0;
		foreach (var item in castellettoIva)
		{
			var imposta = Math.Round(item.Imposta, 2);
			var esigibilitaIva = GetEsigibilitaIVA(item.CodiceEsigibilitaIVA);
			if (esigibilitaIva == EsigibilitaIVAType.S)
				ivaSplitPayment += imposta;

			fatturaElettronicaBody.DatiBeniServizi.DatiRiepilogo[indexCastelletto] = new DatiRiepilogoType
			{
				AliquotaIVA = Math.Round(item.AliquotaIva, 2),
				ImponibileImporto = Math.Round(item.Imponibile, 2),
				Imposta = imposta,
				EsigibilitaIVA = esigibilitaIva,
				EsigibilitaIVASpecified = item.AliquotaIva > 0,

				Natura = GetNaturaType(item.CodiceNatura),
				NaturaSpecified = item.AliquotaIva == 0,
				RiferimentoNormativo = item.RiferimentoNormativo
			};
			indexCastelletto += 1;
		}

		fatturaElettronicaBody.DatiPagamento = new[]
		{
			new DatiPagamentoType
			{
				CondizioniPagamento = GetCondizioniPagamentoType(documento.SdiCodiceCondizionePagamento),
				DettaglioPagamento = new[]
				{
					new DettaglioPagamentoType
					{
						ImportoPagamento = documento.Total-ivaSplitPayment,
						DataScadenzaPagamento = documento.DataScadenzaPagamento.Value.DateTime,
						DataScadenzaPagamentoSpecified = documento.DataScadenzaPagamento > DateTime.MinValue,

						ModalitaPagamento = GetModalitaPagamentoType(documento.SdiCodiceTipoPagamento),
						IBAN = documento.SdiCodiceTipoPagamento=="MP05" ? documento.SdiValoreTipoPagamento.Replace(" ", "") : string.Empty,
					},
				}
			}
		};

		//per adesso non considero la gestione degli allegati
		//if (attachments != null)
		//{
		//	fatturaElettronicaBody.Allegati = new AllegatiType[attachments.Count];
		//	var allegatiIndex = 0;
		//	foreach (var allegato in attachments)
		//	{
		//		var allegatoFullFileName = Path.Combine(ContestoBase.Contesto.PathAllegati, allegato.Path);
		//		if (!File.Exists(allegatoFullFileName))
		//			continue;

		//		fatturaElettronicaBody.Allegati[allegatiIndex] = new AllegatiType
		//		{
		//			Attachment = File.ReadAllBytes(allegatoFullFileName),
		//			FormatoAttachment = allegato.Extension.Replace(".", "").ToUpper(),
		//			NomeAttachment = allegato.FullFileName,
		//		};
		//		allegatiIndex += 1;
		//	}
		//}

		var header = new XmlDocument();
		header.LoadXml(fatturaElettronicaHeader.ToXmlString());
		//header.Save(@"C:\Temp\header-testFatturazione.xml");

		var body = new XmlDocument();
		body.LoadXml(fatturaElettronicaBody.ToXmlString());
		//body.Save(@"C:\Temp\body-testFatturazione.xml");

		var doc = new XmlDocument();

		var s = "<?xml version=\"1.0\" encoding=\"UTF-8\"?>";
		s += $"<p:FatturaElettronica xmlns:p=\"http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2\" versione=\"{formatoTrasmissione}\">";
		s += "<FatturaElettronicaHeader>";
		s += "</FatturaElettronicaHeader>";
		s += "<FatturaElettronicaBody>";
		s += "</FatturaElettronicaBody>";
		s += "</p:FatturaElettronica>";

		doc.LoadXml(s);
		var root = doc.DocumentElement;

		foreach (XmlNode child in header.DocumentElement.ChildNodes)
		{
			XmlNode node = doc.ImportNode(child, true);
			root.FirstChild.AppendChild(node);
		}

		foreach (XmlNode child in body.DocumentElement.ChildNodes)
		{
			XmlNode node = doc.ImportNode(child, true);
			root.LastChild.AppendChild(node);
		}

		//doc.Save(@"C:\Temp\testFatturazione.xml");
		result.Xml = doc.InnerXml;

		return result;
	}

	IEnumerable<CastellettoIva> buildCastellettoIva(IEnumerable<DocumentItemModel> dettagli)
	{
		var castelletto = dettagli.GroupBy(x => new { x.CodiceNatura, x.CodiceEsigibilitaIVA, x.RiferimentoNormativo, x.VatRate })
			.Select(x => new CastellettoIva
			{
				CodiceNatura = x.Key.CodiceNatura,
				CodiceEsigibilitaIVA = x.Key.CodiceEsigibilitaIVA,
				RiferimentoNormativo = x.Key.RiferimentoNormativo,
				AliquotaIva = x.Key.VatRate,
				Imponibile = x.Sum(y => y.RowAmount),
			})
			.ToList();

		return castelletto;
	}

	CondizioniPagamentoType GetCondizioniPagamentoType(string codice)
	{
		//TP01 pagamento a rate
		//TP02 pagamento completo
		//TP03 anticipo
		switch (codice)
		{
			case "TP01":
				return CondizioniPagamentoType.TP01;
			case "TP02":
				return CondizioniPagamentoType.TP02;
			case "TP03":
				return CondizioniPagamentoType.TP03;
			default:
				return CondizioniPagamentoType.TP01;
		}
	}

	ModalitaPagamentoType GetModalitaPagamentoType(string codice)
	{
		//MP01 contanti
		//MP02 assegno
		//MP03 assegno circolare
		//MP04 contanti presso Tesoreria
		//MP05 bonifico
		//MP06 vaglia cambiario
		//MP07 bollettino bancario
		//MP08 carta di credito
		//MP09 RID
		//MP10 RID utenze
		//MP11 RID veloce
		//MP12 Riba
		//MP13 MAV
		//MP14 quietanza erario stato
		//MP15 giroconto su conti di contabilità speciale
		//MP16 domiciliazione bancaria
		//MP17 domiciliazione postale

		switch (codice)
		{
			case "MP01":
				return ModalitaPagamentoType.MP01;
			case "MP02":
				return ModalitaPagamentoType.MP02;
			case "MP03":
				return ModalitaPagamentoType.MP03;
			case "MP04":
				return ModalitaPagamentoType.MP04;
			case "MP05":
				return ModalitaPagamentoType.MP05;
			case "MP06":
				return ModalitaPagamentoType.MP06;
			case "MP07":
				return ModalitaPagamentoType.MP07;
			case "MP08":
				return ModalitaPagamentoType.MP08;
			case "MP09":
				return ModalitaPagamentoType.MP09;
			case "MP10":
				return ModalitaPagamentoType.MP10;
			case "MP11":
				return ModalitaPagamentoType.MP11;
			case "MP12":
				return ModalitaPagamentoType.MP12;
			case "MP13":
				return ModalitaPagamentoType.MP13;
			case "MP14":
				return ModalitaPagamentoType.MP14;
			case "MP15":
				return ModalitaPagamentoType.MP15;
			case "MP16":
				return ModalitaPagamentoType.MP16;
			case "MP17":
				return ModalitaPagamentoType.MP17;
			default:
				return ModalitaPagamentoType.MP01;
		}
	}

	NaturaType GetNaturaType(string codice)
	{
		//N1  escluse ex art. 15
		//N2  non soggette
		//N3  non imponibili
		//N4  esenti
		//N5  regime del margine
		//N6  inversione contabile(reverse charge)

		switch (codice)
		{
			case "N1":
				return NaturaType.N1;
			case "N2.1":
				return NaturaType.N21;
			case "N2.2":
				return NaturaType.N22;
			case "N3.1":
				return NaturaType.N31;
			case "N3.2":
				return NaturaType.N32;
			case "N3.3":
				return NaturaType.N33;
			case "N3.4":
				return NaturaType.N34;
			case "N3.5":
				return NaturaType.N35;
			case "N3.6":
				return NaturaType.N36;
			case "N4":
				return NaturaType.N4;
			case "N5":
				return NaturaType.N5;
			case "N6.1":
				return NaturaType.N61;
			case "N6.2":
				return NaturaType.N62;
			case "N6.3":
				return NaturaType.N63;
			case "N6.4":
				return NaturaType.N64;
			case "N6.5":
				return NaturaType.N65;
			case "N6.6":
				return NaturaType.N66;
			case "N6.7":
				return NaturaType.N67;
			case "N6.8":
				return NaturaType.N68;
			case "N6.9":
				return NaturaType.N69;
			default:
				return NaturaType.N1;
		}
	}

	EsigibilitaIVAType GetEsigibilitaIVA(int codice)
	{
		switch (codice)
		{
			case 0:
				return EsigibilitaIVAType.D;
			case 1:
				return EsigibilitaIVAType.I;
			case 2:
				return EsigibilitaIVAType.S;
			default:
				return EsigibilitaIVAType.D;
		}
	}

	public async Task<string> SendInvoicePR(DocumentModel document, List<DocumentItemModel> details, List<AttachmentModel> attachments = null, string[] notifyTo = null)
	{
		return await Send(FormatoTrasmissioneType.FPR12, document, details, attachments, notifyTo);
	}

	public async Task<string> SendInvoicePA(DocumentModel document, List<DocumentItemModel> details, List<AttachmentModel> attachments = null, string[] notifyTo = null)
	{
		return await Send(FormatoTrasmissioneType.FPA12, document, details, attachments, notifyTo);
	}

	public async Task<string> Send(FormatoTrasmissioneType formatoTrasmissione, DocumentModel DocumentModel, List<DocumentItemModel> details, List<AttachmentModel> attachments = null, string[] notifyTo = null)
	{
		var xmlFilePath = appSettings.XmlFilePath;
		var codiceCliente = appSettings.CodiceCliente;
		var password = System.Text.Encoding.Default.GetBytes(appSettings.Password);

		var fatturaElettronica = await PrepareFatturaElettronica(formatoTrasmissione, DocumentModel, details, attachments);
		var fullFileName = Path.Combine(xmlFilePath, DocumentModel.XmlFileName);

		var xml = fatturaElettronica.Xml;
		//questo replace si rende necessario perché non sono ancora riuscito a cambiare la classe NaturaType e la relativa serializzazione
		xml = xml.Replace("<Natura>N21</Natura>", "<Natura>N2.1</Natura>");
		xml = xml.Replace("<Natura>N22</Natura>", "<Natura>N2.2</Natura>");
		xml = xml.Replace("<Natura>N31</Natura>", "<Natura>N3.1</Natura>");
		xml = xml.Replace("<Natura>N32</Natura>", "<Natura>N3.2</Natura>");
		xml = xml.Replace("<Natura>N33</Natura>", "<Natura>N3.3</Natura>");
		xml = xml.Replace("<Natura>N34</Natura>", "<Natura>N3.4</Natura>");
		xml = xml.Replace("<Natura>N35</Natura>", "<Natura>N3.5</Natura>");
		xml = xml.Replace("<Natura>N36</Natura>", "<Natura>N3.6</Natura>");
		xml = xml.Replace("<Natura>N61</Natura>", "<Natura>N6.1</Natura>");
		xml = xml.Replace("<Natura>N62</Natura>", "<Natura>N6.2</Natura>");
		xml = xml.Replace("<Natura>N63</Natura>", "<Natura>N6.3</Natura>");
		xml = xml.Replace("<Natura>N64</Natura>", "<Natura>N6.4</Natura>");
		xml = xml.Replace("<Natura>N65</Natura>", "<Natura>N6.5</Natura>");
		xml = xml.Replace("<Natura>N66</Natura>", "<Natura>N6.6</Natura>");
		xml = xml.Replace("<Natura>N67</Natura>", "<Natura>N6.7</Natura>");
		xml = xml.Replace("<Natura>N68</Natura>", "<Natura>N6.8</Natura>");
		xml = xml.Replace("<Natura>N69</Natura>", "<Natura>N6.9</Natura>");

		File.WriteAllText(fullFileName, xml);

		if (appSettings.SkipInvioFattura)
			return string.Empty;

		var sdi = await InvioFatturaElettronicaAttiva(codiceCliente, password, xmlFilePath, DocumentModel.XmlFileName, notifyTo);
		if (sdi.HasValue)
			return $"{DateTime.Now:dd/MM/yyyy}{sdi}";

		return string.Empty;
	}

	public async Task<long?> SendElectronicInvoice(string codiceCliente, byte[] password, string filenameUID, string[] notifyTo = null)
	{
		var auth = new Auth
		{
			Password = password
		};

		var send = new SendInvoice
		{
			Filename = filenameUID,
			ToSign = true,
		};
		if (notifyTo != null)
			send.paramEmail = new FatturaElettronicaAttiva.Email() { Address = notifyTo };

		var hub = GetHubFatturaElettronicaAtttiva();
		var response = await hub.SendElectronicInvoiceAsync(auth, send);

		var msg = string.Empty;
		if (response.ResultCode == ResultCode.Success)
		{
			msg = $"IdSdi[{response.IdSdi}] Data[{response.DateSdi}] StatoEmail[{response.StatusEmail}]";
			if (response.StatusEmail == StatusEmail.Error)
			{ }

			return response.IdSdi;
		}

		throw new Exception(string.Join(", ", response.ResultMessage));
	}

	public SolutionDOC_HubSoap GetHubFatturaElettronicaAtttiva()
	{
		return new SolutionDOC_HubSoapClient(SolutionDOC_HubSoapClient.EndpointConfiguration.SolutionDOC_HubSoap12, appSettings.UrlFatturaElettronicaAttiva);
	}

	async Task<long?> InvioFatturaElettronicaAttiva(string clientCode, byte[] password, string xmlFilePath, string xmlFileName, string[] notifyTo = null)
	{
		var nomeFileZipFatturaPa = await GetNomeFileZipFatturaPA(clientCode, password);
		var zipFullFileName = PrepareZipFile(xmlFilePath, xmlFileName, nomeFileZipFatturaPa);
		await UploadFileFatturaPA(clientCode, password, zipFullFileName);

		var idSdi = await SendElectronicInvoice(clientCode, password, zipFullFileName, notifyTo);
		return idSdi;
	}

	string PrepareZipFile(string xmlFilePath, string xmlFileName, string nomeFileZipFatturaPa)
	{
		var xmlFullFileName = Path.Combine(xmlFilePath, xmlFileName);
		var zipPath = Path.Combine(xmlFilePath, "zip");
		if (!Directory.Exists(zipPath))
			Directory.CreateDirectory(zipPath);
		var zipFullFileName = Path.Combine(zipPath, nomeFileZipFatturaPa);

		using var zipToOpen = new FileStream(zipPath, FileMode.Create);
		using var archive = new ZipArchive(zipToOpen, ZipArchiveMode.Create);
		archive.CreateEntryFromFile(zipFullFileName, xmlFullFileName);

		return zipFullFileName;
	}

	async Task<string> GetNomeFileZipFatturaPA(string codiceCliente, byte[] password)
	{
		var hub = GetHubFatturaElettronicaAtttiva();
		var response = await hub.GetNomeFileZipFatturaPAAsync(new GetNomeFileZipFatturaPARequest(codiceCliente, password));
		return response.GetNomeFileZipFatturaPAResult;
	}

	async Task UploadFileFatturaPA(string codiceCliente, byte[] password, string localPathFile)
	{
		if (!File.Exists(localPathFile))
			throw new Exception($"Impossibile trovare il file [{localPathFile}]");

		var MaxRetries = 50; // max number of corrupted chunks or failed transfers to allow before giving up
		var NumRetries = 0;
		var ChunkSizeSampleInterval = 15; // interval to update the chunk size, used in conjunction with AutoSetChunkSize. 
		var Offset = 0; // used in persisting the transfer position
		var numIterations = 0;
		var StartTime = DateTime.Now;

		//if (autoSetChunkSize)
		var chunkSize = 16 * 1024;  // 16Kb default

		var FileSize = new FileInfo(localPathFile).Length;
		var Buffer = new byte[chunkSize];    // this buffer stores each chunk, for sending to the web service via MTOM

		using (var fs = new FileStream(localPathFile, FileMode.Open, FileAccess.Read))
		{
			fs.Position = Offset;
			int BytesRead;
			// send the chunks to the web service one by one, until FileStream.Read() returns 0, meaning the entire file has been read.
			do
			{
				BytesRead = fs.Read(Buffer, 0, chunkSize);  // read the next chunk (if it exists) into the buffer.  the while loop will terminate if there is nothing left to read

				// check if this is the last chunk and resize the bufer as needed to avoid sending a mostly empty buffer (could be 10Mb of 000000000000s in a large chunk)
				if (BytesRead != Buffer.Length)
				{
					chunkSize = BytesRead;
					var TrimmedBuffer = new byte[BytesRead];
					Array.Copy(Buffer, TrimmedBuffer, BytesRead);
					Buffer = TrimmedBuffer; // the trimmed buffer should become the new 'buffer'
				}
				if (Buffer.Length == 0)
					break;  // nothing more to send
				try
				{
					// send this chunk to the server.  it is sent as a byte[] parameter, but the client and server have been configured to encode byte[] using MTOM. 
					var hub = GetHubFatturaElettronicaAtttiva();
					var request = new UploadFileFatturaPARequest(codiceCliente,
						password,
						Path.GetFileName(localPathFile),
						Buffer,
						Offset);
					var response = await hub.UploadFileFatturaPAAsync(request);

					if (response.UploadFileFatturaPAResult.ToLower().StartsWith("error", StringComparison.Ordinal))
						throw new Exception(response.UploadFileFatturaPAResult);

					var currentIntervalMod = numIterations % ChunkSizeSampleInterval;
					if (currentIntervalMod == 0)    // start the timer for this chunk
						StartTime = DateTime.Now;
					else if (currentIntervalMod == 1)
					{
						chunkSize = CalcAndGetChunkSize(chunkSize, StartTime);  // the sample chunk has been transferred, calc the time taken and adjust the chunk size accordingly
						Buffer = new byte[chunkSize];    // reset the size of the buffer for the new chunksize
					}

					// Offset is only updated AFTER a successful send of the bytes. this helps the 'retry' feature to resume the upload from the current Offset position if AppendChunk fails.
					Offset += BytesRead;    // save the offset position for resume
				}
				//catch (WebServiceUpdateException exUpdate)
				//{
				//    fs.Close();
				//    throw exUpdate;
				//}
				catch (Exception ex)
				{
					// rewind the filestream and keep trying
					fs.Position -= BytesRead;

					if (NumRetries++ >= MaxRetries) // too many retries, bail out
					{
						fs.Close();
						throw new Exception($"Error occurred during upload, too many retries. \n{ex.ToString()}");
					}
				}
				numIterations++;
			}
			while (BytesRead > 0);
		}
	}

	int CalcAndGetChunkSize(int chunkSize, DateTime startTime)
	{
		const int preferredTransferDuration = 800;// milliseconds, the timespan the class will attempt to achieve for each chunk, to give responsive feedback on the progress bar.
		long maxRequestLength;
		try
		{
			maxRequestLength = 30240; // custom
		}
		catch (Exception ex)
		{
			maxRequestLength = 4096;    // default, this is updated so that the transfer class knows how much the server will accept
		}

		/* chunk size calculation is defined as follows
		 *		in the examples below, the preferred transfer time is 1500ms, taking one sample.
		 *
		 *									  Example 1									Example 2
		 *		Initial size				= 16384 bytes	(16k)						16384
		 *		Transfer time for 1 chunk	= 800ms										2000 ms
		 *		Average throughput / ms		= 16384b / 800ms = 20.48 b/ms				16384 / 2000 = 8.192 b/ms
		 *		How many bytes in 1500ms?	= 20.48 * 1500 = 30720 bytes				8.192 * 1500 = 12228 bytes
		 *		New chunksize				= 30720 bytes (speed up)					12228 bytes (slow down from original chunk size)
		 */
		var transferTime = DateTime.Now.Subtract(startTime).TotalMilliseconds;
		var averageBytesPerMilliSec = chunkSize / transferTime;
		var preferredChunkSize = averageBytesPerMilliSec * preferredTransferDuration;
		chunkSize = (int)Math.Min(maxRequestLength, Math.Max(4 * 1024, preferredChunkSize));    // set the chunk size so that it takes 1500ms per chunk (estimate), not less than 4Kb and not greater than 4mb // (note 4096Kb sometimes causes problems, probably due to the IIS max request size limit, choosing a slightly smaller max size of 4 million bytes seems to work nicely)
		return chunkSize;
	}
}

public class FatturaElettronica
{
	public DocumentModel DocumentModel { get; set; }
	public string ProgressivoInvio { get; set; }
	public string Xml { get; set; }
}

public class CastellettoIva
{
	public string CodiceNatura { get; set; }
	public int CodiceEsigibilitaIVA { get; set; }
	public string RiferimentoNormativo { get; set; }
	public decimal AliquotaIva { get; set; }
	public decimal Imponibile { get; set; }
	public decimal Imposta => Imponibile * AliquotaIva / 100;
	public decimal Totale => Imponibile + Imposta;
}