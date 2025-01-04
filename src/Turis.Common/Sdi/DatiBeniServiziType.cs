namespace Turis.Common.Sdi
{
    /// <remarks/>
    [System.CodeDom.Compiler.GeneratedCodeAttribute("xsd", "4.6.1055.0")]
    [Serializable()]
    [System.Diagnostics.DebuggerStepThroughAttribute()]
    [System.ComponentModel.DesignerCategoryAttribute("code")]
    [System.Xml.Serialization.XmlTypeAttribute(Namespace="http://ivaservizi.agenziaentrate.gov.it/docs/xsd/fatture/v1.2")]
    public class DatiBeniServiziType {
    
        private DettaglioLineeType[] dettaglioLineeField;
    
        private DatiRiepilogoType[] datiRiepilogoField;
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("DettaglioLinee", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DettaglioLineeType[] DettaglioLinee {
            get {
                return this.dettaglioLineeField;
            }
            set {
                this.dettaglioLineeField = value;
            }
        }
    
        /// <remarks/>
        [System.Xml.Serialization.XmlElementAttribute("DatiRiepilogo", Form=System.Xml.Schema.XmlSchemaForm.Unqualified)]
        public DatiRiepilogoType[] DatiRiepilogo {
            get {
                return this.datiRiepilogoField;
            }
            set {
                this.datiRiepilogoField = value;
            }
        }
    }
}