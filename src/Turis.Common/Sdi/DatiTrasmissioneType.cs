using Turis.Common.Sdi.Enum;

namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiTrasmissioneType {
    
        private IdFiscaleType idTrasmittenteField;
    
        private string progressivoInvioField;
    
        private FormatoTrasmissioneType formatoTrasmissioneField;
    
        private string codiceDestinatarioField;
    
        private ContattiTrasmittenteType contattiTrasmittenteField;
    
        private string pECDestinatarioField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public IdFiscaleType IdTrasmittente {
            get {
                return this.idTrasmittenteField;
            }
            set {
                this.idTrasmittenteField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified, DataType="normalizedString")]
        public string ProgressivoInvio {
            get {
                return this.progressivoInvioField;
            }
            set {
                this.progressivoInvioField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public FormatoTrasmissioneType FormatoTrasmissione {
            get {
                return this.formatoTrasmissioneField;
            }
            set {
                this.formatoTrasmissioneField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string CodiceDestinatario {
            get {
                return this.codiceDestinatarioField;
            }
            set {
                this.codiceDestinatarioField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public ContattiTrasmittenteType ContattiTrasmittente {
            get {
                return this.contattiTrasmittenteField;
            }
            set {
                this.contattiTrasmittenteField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute(Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public string PECDestinatario {
            get {
                return this.pECDestinatarioField;
            }
            set {
                this.pECDestinatarioField = value;
            }
        }
    }
}