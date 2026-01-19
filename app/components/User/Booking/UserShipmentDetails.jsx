'use client'

export default function UserShipmentDetails({
  formData,
  handleInputChange,
  handleSubmit,
  selectedDocuments = [],
  selectedApostilleDocuments = [],
  selectedUaeEmbassyDocuments = [],
  selectedBoardVerificationDocuments = [],
  selectedHecDocuments = [],
  selectedIbccDocuments = [],
  selectedNationalBureauDocuments = [],
  onOpenDocumentModal,
  isReadOnly = false
}) {
  // Determine which document section to show based on selected service
  const getDocumentSectionInfo = () => {
    const service = formData.services || ''

    // Handle International Documents service
    if (service === 'INTL - DOCUMENTS') {
      return {
        heading: 'INTERNATIONAL DOCUMENTS',
        documentCount: selectedDocuments.length + selectedApostilleDocuments.length + selectedUaeEmbassyDocuments.length + selectedBoardVerificationDocuments.length + selectedHecDocuments.length + selectedIbccDocuments.length + selectedNationalBureauDocuments.length,
        onOpen: () => onOpenDocumentModal?.('intlDocuments')
      }
    }

    if (service === 'ATS - Doc MOFA Attestation' || service === 'ATR - Doc MOFA Home Delivery') {
      return {
        heading: 'MOFA ATTESTATION DOCUMENTS',
        documentCount: selectedDocuments.length,
        onOpen: () => onOpenDocumentModal?.('mofa')
      }
    }

    if (service === 'APN - Apostille Normal' || service === 'APU - Apostille Urgent') {
      return {
        heading: 'APOSTILLE DOCUMENTS',
        documentCount: selectedApostilleDocuments.length,
        onOpen: () => onOpenDocumentModal?.('apostille')
      }
    }

    if (service === 'AE - UAE Embassy') {
      return {
        heading: 'UAE EMBASSY DOCUMENTS',
        documentCount: selectedUaeEmbassyDocuments.length,
        onOpen: () => onOpenDocumentModal?.('uaeEmbassy')
      }
    }

    if (service === 'BV - Board Verification') {
      return {
        heading: 'BOARD VERIFICATION DOCUMENTS',
        documentCount: selectedBoardVerificationDocuments.length,
        onOpen: () => onOpenDocumentModal?.('boardVerification')
      }
    }

    if (service === 'HEC - HEC') {
      return {
        heading: 'HEC DOCUMENTS',
        documentCount: selectedHecDocuments.length,
        onOpen: () => onOpenDocumentModal?.('hec')
      }
    }

    if (service === 'IBCC - IBCC') {
      return {
        heading: 'IBCC DOCUMENTS',
        documentCount: selectedIbccDocuments.length,
        onOpen: () => onOpenDocumentModal?.('ibcc')
      }
    }

    if (service === 'National Bureau') {
      return {
        heading: 'NATIONAL BUREAU DOCUMENTS',
        documentCount: selectedNationalBureauDocuments.length,
        onOpen: () => onOpenDocumentModal?.('nationalBureau')
      }
    }

    return null
  }

  const documentSection = getDocumentSectionInfo()

  // Get services based on selected product
  const getServicesByProduct = () => {
    const product = formData.product || ''

    if (product === 'General') {
      return [
        { value: 'Over Night', label: 'Over Night' },
        { value: 'L-Flayer', label: 'L-Flayer' },
        { value: 'N1 - Blue Box 1kg', label: 'N1 - Blue Box 1kg' },
        { value: 'N2 - Blue Box 2kg', label: 'N2 - Blue Box 2kg' },
        { value: 'N3 - Blue Box 3kg', label: 'N3 - Blue Box 3kg' },
        { value: 'N4 - Blue Box 4kg', label: 'N4 - Blue Box 4kg' },
        { value: 'N5 - Blue Box 5kg', label: 'N5 - Blue Box 5kg' },
        { value: 'N6 - Blue Box 6kg', label: 'N6 - Blue Box 6kg' },
        { value: 'N7 - Blue Box 7kg', label: 'N7 - Blue Box 7kg' },
        { value: 'N8 - Blue Box 8kg', label: 'N8 - Blue Box 8kg' },
        { value: 'N9 - Blue Box 9kg', label: 'N9 - Blue Box 9kg' },
        { value: 'N10 - Blue Box 10kg', label: 'N10 - Blue Box 10kg' },
        { value: 'N15 - Blue Box 15kg', label: 'N15 - Blue Box 15kg' },
        { value: 'N20 - Blue Box 20kg', label: 'N20 - Blue Box 20kg' },
        { value: 'N25 - Blue Box 25kg', label: 'N25 - Blue Box 25kg' },
        { value: 'S - Same Day Delivery', label: 'S - Same Day Delivery' },
        { value: 'DTN - 2nd Day Service', label: 'DTN - 2nd Day Service' },
        { value: 'S1 - 2nd Day 3kg Box', label: 'S1 - 2nd Day 3kg Box' },
        { value: 'S2 - 2nd Day 4kg Box', label: 'S2 - 2nd Day 4kg Box' },
        { value: 'S3 - 2nd Day 5kg Box', label: 'S3 - 2nd Day 5kg Box' },
        { value: 'S4 - 2nd Day 10kg Box', label: 'S4 - 2nd Day 10kg Box' },
        { value: 'S5 - 2nd Day 15kg Box', label: 'S5 - 2nd Day 15kg Box' },
        { value: 'S6 - 2nd Day 20kg Box', label: 'S6 - 2nd Day 20kg Box' },
        { value: 'S7 - 2nd Day 25kg Box', label: 'S7 - 2nd Day 25kg Box' },
        { value: 'ATS - Doc MOFA Attestation', label: 'ATS - Doc MOFA Attestation' },
        { value: 'ATR - Doc MOFA Home Delivery', label: 'ATR - Doc MOFA Home Delivery' },
        { value: 'APN - Apostille Normal', label: 'APN - Apostille Normal' },
        { value: 'APU - Apostille Urgent', label: 'APU - Apostille Urgent' },
        { value: 'AE - UAE Embassy', label: 'AE - UAE Embassy' },
        { value: 'BV - Board Verification', label: 'BV - Board Verification' },
        { value: 'HEC - HEC', label: 'HEC - HEC' },
        { value: 'IBCC - IBCC', label: 'IBCC - IBCC' },
        { value: 'National Bureau', label: 'National Bureau' },
      ]
    } else if (product === 'International') {
      return [
        { value: 'INTL - DOCUMENTS', label: 'INTL - DOCUMENTS' },
        { value: 'INTL - NON DOCUMENTS', label: 'INTL - NON DOCUMENTS' },
      ]
    } else if (product === 'OLE') {
      return [
        { value: 'OLE - OVERLAND', label: 'OLE - OVERLAND' },
        { value: 'OLE - PACK AND GO', label: 'OLE - PACK AND GO' },
      ]
    } else if (product === 'Logistics') {
      return [
        { value: 'LC - CARGO', label: 'LC - CARGO' },
      ]
    } else if (product === 'Sentiments') {
      return [
        { value: 'SE - SAME DAY', label: 'SE - SAME DAY' },
        { value: 'SE - OVERNIGHT', label: 'SE - OVERNIGHT' },
      ]
    }

    return []
  }

  const availableServices = getServicesByProduct()

  return (
    <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
      {/* Header */}
      <div className="bg-sky-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Shipment Details</h2>
      </div>

      {/* Form Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-5">
            {/* Product */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product <span className="text-red-500">*</span>
              </label>
              <select
                name="product"
                value={formData.product}
                onChange={handleInputChange}
                required
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition-colors"
              >
                <option value="" disabled>Select Product</option>
                <option value="General">General</option>
                <option value="International">International</option>
                <option value="OLE">OLE</option>
                <option value="Logistics">Logistics</option>
                <option value="Sentiments">Sentiments</option>
              </select>
            </div>

            {/* Destination */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Destination <span className="text-red-500">*</span>
              </label>
              <select
                name="destination"
                value={formData.destination}
                onChange={handleInputChange}
                required
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition-colors"
              >
                <option value="">Select Destination</option>
                <option value="AZR - 18 Hazari">AZR - 18 Hazari</option>
                <option value="TTC - 36 Chowk">TTC - 36 Chowk</option>
                <option value="ABT - Abbotabad">ABT - Abbotabad</option>
                <option value="AHT - Abdul Hakim">AHT - Abdul Hakim</option>
                <option value="MCW - Adda Machiwal">MCW - Adda Machiwal</option>
                <option value="APE - Ahmad Pur East">APE - Ahmad Pur East</option>
                <option value="AKT - Akora Khatak">AKT - Akora Khatak</option>
                <option value="AUI - AL Puri">AUI - AL Puri</option>
                <option value="APC - Ali Pur Chatha">APC - Ali Pur Chatha</option>
                <option value="AIP - Ali Pur">AIP - Ali Pur</option>
                <option value="AFA - Arif Wala">AFA - Arif Wala</option>
                <option value="ATT - Attock">ATT - Attock</option>
                <option value="AWR - Awaran">AWR - Awaran</option>
                <option value="BBA - Adda Bun Bosan">BBA - Adda Bun Bosan</option>
                <option value="ALR - Adda Lar">ALR - Adda Lar</option>
                <option value="ADZ - ADDA Zakheera">ADZ - ADDA Zakheera</option>
                <option value="APL - Ahmed pur lamma">APL - Ahmed pur lamma</option>
                <option value="APS - Ahmed Pur Sial">APS - Ahmed Pur Sial</option>
                <option value="ARI - Amberi Kalla">ARI - Amberi Kalla</option>
                <option value="AMB - Aminpur Banglow">AMB - Aminpur Banglow</option>
                <option value="BDN - Badin">BDN - Badin</option>
                <option value="BGH - Bagh">BGH - Bagh</option>
                <option value="NGR - Bahawalnagar">NGR - Bahawalnagar</option>
                <option value="BHV - Bahawalpur">BHV - Bahawalpur</option>
                <option value="BAK - Bakrani">BAK - Bakrani</option>
                <option value="BKT - Balakot">BKT - Balakot</option>
                <option value="BNP - Bannu">BNP - Bannu</option>
                <option value="BOT - Bari Kot">BOT - Bari Kot</option>
                <option value="BkH - Barkhan">BkH - Barkhan</option>
                <option value="NLA - Barnala A.J.K">NLA - Barnala A.J.K</option>
                <option value="BLM - Basti Malook">BLM - Basti Malook</option>
                <option value="BGM - Batgaram">BGM - Batgaram</option>
                <option value="BTK - Batkhela">BTK - Batkhela</option>
                <option value="BPR - Bhai Pharu">BPR - Bhai Pharu</option>
                <option value="BKK - Bhakkar">BKK - Bhakkar</option>
                <option value="BWL - Bhalwal">BWL - Bhalwal</option>
                <option value="BSH - Bhit Shah">BSH - Bhit Shah</option>
                <option value="ASH - Bisham">ASH - Bisham</option>
                <option value="ONI - Booni">ONI - Booni</option>
                <option value="BCK - Bucheki">BCK - Bucheki</option>
                <option value="BRW - Burewala">BRW - Burewala</option>
                <option value="BJR - Bajwar">BJR - Bajwar</option>
                <option value="GOG - Banglow Gogera">GOG - Banglow Gogera</option>
                <option value="BRK - Bara Kahu">BRK - Bara Kahu</option>
                <option value="BRN - Barnala">BRN - Barnala</option>
                <option value="BSR - Basir Pur">BSR - Basir Pur</option>
                <option value="BLA - Bela">BLA - Bela</option>
                <option value="SBD - Bhan Saeedabad">SBD - Bhan Saeedabad</option>
                <option value="BWA - Bhawana">BWA - Bhawana</option>
                <option value="BRA - Bhera">BRA - Bhera</option>
                <option value="BMR - Bhimbar">BMR - Bhimbar</option>
                <option value="BRC - Bhiria City">BRC - Bhiria City</option>
                <option value="BRD - Bhiria Road">BRD - Bhiria Road</option>
                <option value="BCM - Buchiana Mandi">BCM - Buchiana Mandi</option>
                <option value="BST - Budhla Sant">BST - Budhla Sant</option>
                <option value="BUR - Bunair">BUR - Bunair</option>
                <option value="CRA - Chakdara">CRA - Chakdara</option>
                <option value="CKL - Chakwal">CKL - Chakwal</option>
                <option value="CMN - Chaman">CMN - Chaman</option>
                <option value="CSD - Charsadda">CSD - Charsadda</option>
                <option value="CTL - Chatrial">CTL - Chatrial</option>
                <option value="CWD - Chawinda">CWD - Chawinda</option>
                <option value="AWH - Chenab Nagar">AWH - Chenab Nagar</option>
                <option value="CCW - Chichawatni">CCW - Chichawatni</option>
                <option value="IOT - Chiniot">IOT - Chiniot</option>
                <option value="CHT - Chishtian">CHT - Chishtian</option>
                <option value="WCA - Chonawala">WCA - Chonawala</option>
                <option value="CAZ - Chowk Azam">CAZ - Chowk Azam</option>
                <option value="CUK - Chundiko">CUK - Chundiko</option>
                <option value="CHN - Chunia">CHN - Chunia</option>
                <option value="CHO - chachro">CHO - chachro</option>
                <option value="CJS - Chak Jhumra">CJS - Chak Jhumra</option>
                <option value="CkR - Chak Sawari">CkR - Chak Sawari</option>
                <option value="CHM - Chamber">CHM - Chamber</option>
                <option value="CMG - Changa Manga">CMG - Changa Manga</option>
                <option value="CGT - Chani Goth">CGT - Chani Goth</option>
                <option value="SMA - Chashma">SMA - Chashma</option>
                <option value="CLL - Chillas Sherz">CLL - Chillas Sherz</option>
                <option value="CDS - Choa Syedan Shah">CDS - Choa Syedan Shah</option>
                <option value="COC - Chor Cant">COC - Chor Cant</option>
                <option value="DDU - Dadu">DDU - Dadu</option>
                <option value="DYL - Dadyal A.J.K">DYL - Dadyal A.J.K</option>
                <option value="DKI - Daharki">DKI - Daharki</option>
                <option value="DWA - Dahranwala">DWA - Dahranwala</option>
                <option value="DDP - Daira Deen Panah">DDP - Daira Deen Panah</option>
                <option value="LDJ - Dajal">LDJ - Dajal</option>
                <option value="DLB - Dalbandin">DLB - Dalbandin</option>
                <option value="DDk - Dara Adam Khel">DDk - Dara Adam Khel</option>
                <option value="DRG - Dargai">DRG - Dargai</option>
                <option value="DSH - Darosh">DSH - Darosh</option>
                <option value="DAH - Dary Khan">DAH - Dary Khan</option>
                <option value="DKA - Daska">DKA - Daska</option>
                <option value="DKL - Daud Khel">DKL - Daud Khel</option>
                <option value="DTR - daulatpur">DTR - daulatpur</option>
                <option value="DPA - Depalpur">DPA - Depalpur</option>
                <option value="DGK - Dera Ghazi Khan">DGK - Dera Ghazi Khan</option>
                <option value="DIK - Dera Ismail Khan">DIK - Dera Ismail Khan</option>
                <option value="DMJ - Deramurad Jamal">DMJ - Deramurad Jamal</option>
                <option value="DHR - Dhadar">DHR - Dhadar</option>
                <option value="DAT - Dhamtal">DAT - Dhamtal</option>
                <option value="DHk - Dheerkot">DHk - Dheerkot</option>
                <option value="DOK - Dhodhak">DOK - Dhodhak</option>
                <option value="DHN - Dhoro Naro">DHN - Dhoro Naro</option>
                <option value="DIN - Dina">DIN - Dina</option>
                <option value="DLO - Diplo">DLO - Diplo</option>
                <option value="UKI - Dukki">UKI - Dukki</option>
                <option value="DKT - Dakota">DKT - Dakota</option>
                <option value="DNR - Danyor">DNR - Danyor</option>
                <option value="DTA - Daultala">DTA - Daultala</option>
                <option value="DAY - Dera Allahyar">DAY - Dera Allahyar</option>
                <option value="ANO - Dhanola">ANO - Dhanola</option>
                <option value="DNT - Dhanot">DNT - Dhanot</option>
                <option value="DIG - Digri">DIG - Digri</option>
                <option value="DIJ - Dijkot">DIJ - Dijkot</option>
                <option value="DNG - Dinga">DNG - Dinga</option>
                <option value="ORI - Dokri">ORI - Dokri</option>
                <option value="DLT - Dolat Nagar">DLT - Dolat Nagar</option>
                <option value="DOR - Dour">DOR - Dour</option>
                <option value="DLW - Dulle Wala">DLW - Dulle Wala</option>
                <option value="DUN - Dunya Pur">DUN - Dunya Pur</option>
                <option value="ELA - Ellah Abad">ELA - Ellah Abad</option>
                <option value="FSD - Faisalabad">FSD - Faisalabad</option>
                <option value="FAD - Farroqabad">FAD - Farroqabad</option>
                <option value="FTG - Fateh Jhang">FTG - Fateh Jhang</option>
                <option value="FPR - Fateh pur">FPR - Fateh pur</option>
                <option value="FWA - Feroz Watowan">FWA - Feroz Watowan</option>
                <option value="FRZ - Feroza">FRZ - Feroza</option>
                <option value="FAB - Fort Abbas">FAB - Fort Abbas</option>
                <option value="FQW - Faqir Wali">FQW - Faqir Wali</option>
                <option value="FZP - Fazil Pur">FZP - Fazil Pur</option>
                <option value="GDN - Gadoon Amazai">GDN - Gadoon Amazai</option>
                <option value="GBC - Gambat City">GBC - Gambat City</option>
                <option value="GKR - Gari Khairo">GKR - Gari Khairo</option>
                <option value="GWR - Gawadar">GWR - Gawadar</option>
                <option value="GHT - GF">GHT - GF</option>
                <option value="GTI - Ghotki">GTI - Ghotki</option>
                <option value="GIL - Gilgit">GIL - Gilgit</option>
                <option value="RRA - Gojra">RRA - Gojra</option>
                <option value="GOL - Golarchi">GOL - Golarchi</option>
                <option value="GDU - Guddu">GDU - Guddu</option>
                <option value="GKN - Gujarkhan">GKN - Gujarkhan</option>
                <option value="GUJ - Gujranwala">GUJ - Gujranwala</option>
                <option value="GJT - Gujrat">GJT - Gujrat</option>
                <option value="GMD - Gaggo Mandi">GMD - Gaggo Mandi</option>
                <option value="GGR - Gahkuch Ghizer">GGR - Gahkuch Ghizer</option>
                <option value="GBT - Gambat">GBT - Gambat</option>
                <option value="GMO - Garh Mor">GMO - Garh Mor</option>
                <option value="GRM - Garha Mor">GRM - Garha Mor</option>
                <option value="GYS - Gari Yasin">GYS - Gari Yasin</option>
                <option value="GHK - Ghakar">GHK - Ghakar</option>
                <option value="IHA - Ghakuch Ghzr">IHA - Ghakuch Ghzr</option>
                <option value="GNY - Ghalanay">GNY - Ghalanay</option>
                <option value="GRO - Gharo">GRO - Gharo</option>
                <option value="GAD - Ghazi Abad">GAD - Ghazi Abad</option>
                <option value="GPR - Ghous Pur">GPR - Ghous Pur</option>
                <option value="OJR - Gojra">OJR - Gojra</option>
                <option value="HZD - Hafizabad">HZD - Hafizabad</option>
                <option value="HFZ - Hafizwala">HFZ - Hafizwala</option>
                <option value="HAJ - Hajira">HAJ - Hajira</option>
                <option value="HLA - Hala">HLA - Hala</option>
                <option value="HCY - Halani City">HCY - Halani City</option>
                <option value="HRI - Haripur">HRI - Haripur</option>
                <option value="HNI - Harnai">HNI - Harnai</option>
                <option value="HRN - Haroonabad">HRN - Haroonabad</option>
                <option value="HSL - Hasilpur">HSL - Hasilpur</option>
                <option value="HSN - Hassan Abdal">HSN - Hassan Abdal</option>
                <option value="HTR - Hatter">HTR - Hatter</option>
                <option value="HVL - Havellian">HVL - Havellian</option>
                <option value="HUB - Hub">HUB - Hub</option>
                <option value="HMK - Humak">HMK - Humak</option>
                <option value="HDD - Hyderabad">HDD - Hyderabad</option>
                <option value="HNG - Hangu">HNG - Hangu</option>
                <option value="HNL - Hamouli">HNL - Hamouli</option>
                <option value="HRR - Harrapa">HRR - Harrapa</option>
                <option value="HKL - Haveli Lakha">HKL - Haveli Lakha</option>
                <option value="HOO - Hazro">HOO - Hazro</option>
                <option value="HSM - Hujra Shamuqeem">HSM - Hujra Shamuqeem</option>
                <option value="HZN - Hunza">HZN - Hunza</option>
                <option value="IQL - Iqbalabad">IQL - Iqbalabad</option>
                <option value="ISB - Islamabad">ISB - Islamabad</option>
                <option value="IKL - Issa Khel">IKL - Issa Khel</option>
                <option value="ING - Iqbal Nagar">ING - Iqbal Nagar</option>
                <option value="IKD - Iskandarabad">IKD - Iskandarabad</option>
                <option value="IMK - Islamkot">IMK - Islamkot</option>
                <option value="JCB - Jacobabad">JCB - Jacobabad</option>
                <option value="JMP - Jampur">JMP - Jampur</option>
                <option value="JMO - Jamshoro">JMO - Jamshoro</option>
                <option value="JND - Jand">JND - Jand</option>
                <option value="JWA - Jaranwala">JWA - Jaranwala</option>
                <option value="JHG - Jhang">JHG - Jhang</option>
                <option value="JHN - Jhanian">JHN - Jhanian</option>
                <option value="JPT - Jhat Pat">JPT - Jhat Pat</option>
                <option value="JLM - Jhelum">JLM - Jhelum</option>
                <option value="JYL - Jhol">JYL - Jhol</option>
                <option value="OJD - Jhudo">OJD - Jhudo</option>
                <option value="JRD - Jouharabad">JRD - Jouharabad</option>
                <option value="EOA - Jaglot">EOA - Jaglot</option>
                <option value="JLJ - Jalalpur Jattan">JLJ - Jalalpur Jattan</option>
                <option value="JPP - Jalalpur Pirwala">JPP - Jalalpur Pirwala</option>
                <option value="JDW - Jamaldin Wali">JDW - Jamaldin Wali</option>
                <option value="ORJ - Jaranwala">ORJ - Jaranwala</option>
                <option value="JAR - Jarwar">JAR - Jarwar</option>
                <option value="JTI - Jatoi">JTI - Jatoi</option>
                <option value="JVR - Jawarian">JVR - Jawarian</option>
                <option value="JRI - Jhangira">JRI - Jhangira</option>
                <option value="JHI - Johi">JHI - Johi</option>
                <option value="BLL - Kabal">BLL - Kabal</option>
                <option value="KBB - Kabir Wala">KBB - Kabir Wala</option>
                <option value="KKL - Kakul">KKL - Kakul</option>
                <option value="KKU - Kala Shah Kaku">KKU - Kala Shah Kaku</option>
                <option value="KLT - Kalat">KLT - Kalat</option>
                <option value="OOR - Kaloor Kot">OOR - Kaloor Kot</option>
                <option value="KLA - Kamalia">KLA - Kamalia</option>
                <option value="KAK - Kamber Ali Khan">KAK - Kamber Ali Khan</option>
                <option value="KER - Kameer">KER - Kameer</option>
                <option value="KMI - Kamer Moshani">KMI - Kamer Moshani</option>
                <option value="KMK - Kamoke">KMK - Kamoke</option>
                <option value="KMA - Kamra">KMA - Kamra</option>
                <option value="KNU - Kana Nau">KNU - Kana Nau</option>
                <option value="KKK - Kandh Kot">KKK - Kandh Kot</option>
                <option value="KUP - Kangan Pur">KUP - Kangan Pur</option>
                <option value="KHI - Karachi">KHI - Karachi</option>
                <option value="KRK - Karak">KRK - Karak</option>
                <option value="KPC - Karor Pakka">KPC - Karor Pakka</option>
                <option value="KHM - Kashmore">KHM - Kashmore</option>
                <option value="KSR - Kasur">KSR - Kasur</option>
                <option value="KHP - Khairpur">KHP - Khairpur</option>
                <option value="KNS - Khairpur Nathan">KNS - Khairpur Nathan</option>
                <option value="KBL - Khan Bela">KBL - Khan Bela</option>
                <option value="KWL - Khanewal">KWL - Khanewal</option>
                <option value="NPR - KhanPur">NPR - KhanPur</option>
                <option value="NMR - KhanPur Maher">NMR - KhanPur Maher</option>
                <option value="KPL - Khaplu">KPL - Khaplu</option>
                <option value="KHR - Kharan">KHR - Kharan</option>
                <option value="KRN - Kharian">KRN - Kharian</option>
                <option value="KNZ - Khonazai">KNZ - Khonazai</option>
                <option value="SAB - Khushab">SAB - Khushab</option>
                <option value="UDR - Khuzdar">UDR - Khuzdar</option>
                <option value="OHT - Kohat">OHT - Kohat</option>
                <option value="KOT - Kot Addu">KOT - Kot Addu</option>
                <option value="KHT - Kot Chutta">KHT - Kot Chutta</option>
                <option value="KTM - Kot Mitthan">KTM - Kot Mitthan</option>
                <option value="KDC - Kot Radha Kisha">KDC - Kot Radha Kisha</option>
                <option value="KLY - Kotli A.J.K">KLY - Kotli A.J.K</option>
                <option value="KTI - Kotri">KTI - Kotri</option>
                <option value="KCU - Kuchlak">KCU - Kuchlak</option>
                <option value="UMB - Kumb">UMB - Kumb</option>
                <option value="KNN - Kundian">KNN - Kundian</option>
                <option value="KOO - Kacha Kho">KOO - Kacha Kho</option>
                <option value="KTA - Kahota">KTA - Kahota</option>
                <option value="KBH - Kala Bagh">KBH - Kala Bagh</option>
                <option value="KLK - Kalar Kahar">KLK - Kalar Kahar</option>
                <option value="KLS - Kalar Syedan">KLS - Kalar Syedan</option>
                <option value="KAY - Kalaskay">KAY - Kalaskay</option>
                <option value="KDI - Kandiari">KDI - Kandiari</option>
                <option value="KND - Kandyaro">KND - Kandyaro</option>
                <option value="KAR - Karor Lalesan">KAR - Karor Lalesan</option>
                <option value="KSW - Kasowal">KSW - Kasowal</option>
                <option value="KLG - Katlang">KLG - Katlang</option>
                <option value="KTW - Khairpur Tamewal">KTW - Khairpur Tamewal</option>
                <option value="GRH - Khan Garh">GRH - Khan Garh</option>
                <option value="KQS - Khanqa Sharif">KQS - Khanqa Sharif</option>
                <option value="KRC - Kharian Cant">KRC - Kharian Cant</option>
                <option value="KZK - Khazakhela">KZK - Khazakhela</option>
                <option value="KDW - Khidder Wala">KDW - Khidder Wala</option>
                <option value="KPR - Khipro">KPR - Khipro</option>
                <option value="RTA - Khuiratta">RTA - Khuiratta</option>
                <option value="IHU - Kohilu">IHU - Kohilu</option>
                <option value="KGM - Kot Ghulam Muhd">KGM - Kot Ghulam Muhd</option>
                <option value="KMN - Kot Momin">KMN - Kot Momin</option>
                <option value="KSB - Kot Samabah">KSB - Kot Samabah</option>
                <option value="KTL - Kotla">KTL - Kotla</option>
                <option value="KJA - Kotla Jam">KJA - Kotla Jam</option>
                <option value="KNI - Kunri">KNI - Kunri</option>
                <option value="LHE - Lahore">LHE - Lahore</option>
                <option value="LKI - Laki Marwat">LKI - Laki Marwat</option>
                <option value="LLM - Lala Musa">LLM - Lala Musa</option>
                <option value="LAR - Larkana">LAR - Larkana</option>
                <option value="LYY - Layyah">LYY - Layyah</option>
                <option value="LQR - Liaquatpur">LQR - Liaquatpur</option>
                <option value="LOD - Lodharan">LOD - Lodharan</option>
                <option value="LRI - Lora Lai">LRI - Lora Lai</option>
                <option value="LDN - Luddan">LDN - Luddan</option>
                <option value="LLI - Lalian">LLI - Lalian</option>
                <option value="LNK - Landikotal">LNK - Landikotal</option>
                <option value="MDJ - Madeji">MDJ - Madeji</option>
                <option value="MYN - Madyan">MYN - Madyan</option>
                <option value="MLT - Mailsi">MLT - Mailsi</option>
                <option value="MDA - Makhdoom Aali">MDA - Makhdoom Aali</option>
                <option value="MLK - Malak Wal">MLK - Malak Wal</option>
                <option value="MKN - Mamun kanjan">MKN - Mamun kanjan</option>
                <option value="MBD - Mandi Bahuddin">MBD - Mandi Bahuddin</option>
                <option value="MGL - Mangla">MGL - Mangla</option>
                <option value="MVL - Mangowal">MVL - Mangowal</option>
                <option value="MKR - Mankera">MKR - Mankera</option>
                <option value="MNA - Manshera">MNA - Manshera</option>
                <option value="MDN - Mardan">MDN - Mardan</option>
                <option value="MTG - Mastung">MTG - Mastung</option>
                <option value="MTI - Matli">MTI - Matli</option>
                <option value="TNM - Mattani">TNM - Mattani</option>
                <option value="MHR - Mehar">MHR - Mehar</option>
                <option value="MKT - Mehmoodkot">MKT - Mehmoodkot</option>
                <option value="MRP - Mehrab Pur">MRP - Mehrab Pur</option>
                <option value="MCN - Mian Chanoo">MCN - Mian Chanoo</option>
                <option value="MWI - MianWali">MWI - MianWali</option>
                <option value="MCD - Minchanabad">MCD - Minchanabad</option>
                <option value="SWT - Mingora (Swat)">SWT - Mingora (Swat)</option>
                <option value="MLL - Mir Ali">MLL - Mir Ali</option>
                <option value="MNH - Miran Shah">MNH - Miran Shah</option>
                <option value="QML - Mirpur A.J.K">QML - Mirpur A.J.K</option>
                <option value="MPK - Mirpur khas">MPK - Mirpur khas</option>
                <option value="MPM - Mirpur Mathelo">MPM - Mirpur Mathelo</option>
                <option value="YIA - Mithyani">YIA - Mithyani</option>
                <option value="MRO - Moro">MRO - Moro</option>
                <option value="MUH - Much">MUH - Much</option>
                <option value="MUX - Multan">MUX - Multan</option>
                <option value="MRY - Muridkey">MRY - Muridkey</option>
                <option value="REE - Muree">REE - Muree</option>
                <option value="LMB - Muslim Bagh">LMB - Muslim Bagh</option>
                <option value="MAK - Muzafarabad A.J.K">MAK - Muzafarabad A.J.K</option>
                <option value="MZG - Muzafargarh">MZG - Muzafargarh</option>
                <option value="MGT - Machi Goth">MGT - Machi Goth</option>
                <option value="MPD - Makhdoom Pur">MPD - Makhdoom Pur</option>
                <option value="WLA - Manawala">WLA - Manawala</option>
                <option value="MSH - Mandi Shah">MSH - Mandi Shah</option>
                <option value="MOG - Memon Goth">MOG - Memon Goth</option>
                <option value="DAM - Miani Adda">DAM - Miani Adda</option>
                <option value="MHD - Minchanabad">MHD - Minchanabad</option>
                <option value="MRK - Miro Khan">MRK - Miro Khan</option>
                <option value="MSO - Mirpur Sakro">MSO - Mirpur Sakro</option>
                <option value="MGR - Mirwah Gorchani">MGR - Mirwah Gorchani</option>
                <option value="MIT - Mithi">MIT - Mithi</option>
                <option value="MRI - Mityari">MRI - Mityari</option>
                <option value="IBL - Mongi Bangla">IBL - Mongi Bangla</option>
                <option value="MOK - Mor Kunda">MOK - Mor Kunda</option>
                <option value="MEB - More Eminabad">MEB - More Eminabad</option>
                <option value="MMP - Mubarak Pur">MMP - Mubarak Pur</option>
                <option value="UMR - Muhammad Pur">UMR - Muhammad Pur</option>
                <option value="IAA - Murid Wala">IAA - Murid Wala</option>
                <option value="KYA - Nakyal">KYA - Nakyal</option>
                <option value="NKS - Nankana Sahib">NKS - Nankana Sahib</option>
                <option value="NMD - Narang Mandi">NMD - Narang Mandi</option>
                <option value="NRL - Narowal">NRL - Narowal</option>
                <option value="NDR - Naudero">NDR - Naudero</option>
                <option value="WNS - Nawab Shah">WNS - Nawab Shah</option>
                <option value="YAL - Naya Lahore">YAL - Naya Lahore</option>
                <option value="EDA - New Saeedabad">EDA - New Saeedabad</option>
                <option value="NIL - Nilor">NIL - Nilor</option>
                <option value="NHO - Noor Shah">NHO - Noor Shah</option>
                <option value="NOK - Noshki">NOK - Noshki</option>
                <option value="NOW - Nowshera">NOW - Nowshera</option>
                <option value="NWV - Nowshera Virka">NWV - Nowshera Virka</option>
                <option value="NAP - Nagarparkar">NAP - Nagarparkar</option>
                <option value="NLB - Narwala Bangla">NLB - Narwala Bangla</option>
                <option value="NBD - Nasirabad">NBD - Nasirabad</option>
                <option value="ERA - Naushera">ERA - Naushera</option>
                <option value="JLA - Nawan Jandan Wala">JLA - Nawan Jandan Wala</option>
                <option value="NJT - New Jatoi">NJT - New Jatoi</option>
                <option value="NUD - Nooriabad">NUD - Nooriabad</option>
                <option value="NOP - NoorPur">NOP - NoorPur</option>
                <option value="NFZ - Noshero Feroz">NFZ - Noshero Feroz</option>
                <option value="NPT - Nurpur Thal">NPT - Nurpur Thal</option>
                <option value="OKR - Okara">OKR - Okara</option>
                <option value="OHD - OLE">OHD - OLE</option>
                <option value="OGI - Oghi">OGI - Oghi</option>
                <option value="OKC - Okara Cant">OKC - Okara Cant</option>
                <option value="PCC - Pacca Chang">PCC - Pacca Chang</option>
                <option value="PSA - Paf Base">PSA - Paf Base</option>
                <option value="IPK - Paikhel">IPK - Paikhel</option>
                <option value="PPS - Pak Pattan sharif">PPS - Pak Pattan sharif</option>
                <option value="PGN - Panjgiran">PGN - Panjgiran</option>
                <option value="PJG - Panjgoor">PJG - Panjgoor</option>
                <option value="PNQ - Pannu Aqil">PNQ - Pannu Aqil</option>
                <option value="PYA - Panyolia">PYA - Panyolia</option>
                <option value="CRI - Parachinar">CRI - Parachinar</option>
                <option value="PSN - Pasni">PSN - Pasni</option>
                <option value="PRR - Pasroor">PRR - Pasroor</option>
                <option value="PTI - Patoki">PTI - Patoki</option>
                <option value="PEW - Peshawar">PEW - Peshawar</option>
                <option value="PHR - Phlor">PHR - Phlor</option>
                <option value="UWU - Phularwan">UWU - Phularwan</option>
                <option value="PDK - Pind Dadan Khan">PDK - Pind Dadan Khan</option>
                <option value="PRG - Pir Jo Goth">PRG - Pir Jo Goth</option>
                <option value="PML - Pir Mahal">PML - Pir Mahal</option>
                <option value="PJT - Piryalo">PJT - Piryalo</option>
                <option value="PYO - Piryalo">PYO - Piryalo</option>
                <option value="NPI - Pishin">NPI - Pishin</option>
                <option value="PHT - Pithoro">PHT - Pithoro</option>
                <option value="PBI - Pubbi">PBI - Pubbi</option>
                <option value="DNI - Padidan">DNI - Padidan</option>
                <option value="PHP - Pahar Pur">PHP - Pahar Pur</option>
                <option value="PAN - Painsra">PAN - Painsra</option>
                <option value="PUL - Palandri">PUL - Palandri</option>
                <option value="PAC - Panu Aqil Cant">PAC - Panu Aqil Cant</option>
                <option value="PHL - Phalia">PHL - Phalia</option>
                <option value="PWI - Pharianwala">PWI - Pharianwala</option>
                <option value="PIL - Pharianwala">PIL - Pharianwala</option>
                <option value="ILA - Pharianwali">ILA - Pharianwali</option>
                <option value="PBN - Pindi Bhattian">PBN - Pindi Bhattian</option>
                <option value="PGB - Pindi Gheb">PGB - Pindi Gheb</option>
                <option value="PLN - Piplan">PLN - Piplan</option>
                <option value="PON - Pooran">PON - Pooran</option>
                <option value="KSF - Qilla Saifullah">KSF - Qilla Saifullah</option>
                <option value="UET - Quetta">UET - Quetta</option>
                <option value="QBL - Qaboola">QBL - Qaboola</option>
                <option value="QPR - Qadirpur Rawan">QPR - Qadirpur Rawan</option>
                <option value="BQA - Qasim Bharwana">BQA - Qasim Bharwana</option>
                <option value="QAL - Qalandrabad">QAL - Qalandrabad</option>
                <option value="QAZ - Qazi Ahmed">QAZ - Qazi Ahmed</option>
                <option value="QDS - Quaidabad">QDS - Quaidabad</option>
                <option value="RYK - Rahim Yar Khan">RYK - Rahim Yar Khan</option>
                <option value="RND - Raiwand">RND - Raiwand</option>
                <option value="RJP - Rajanpur">RJP - Rajanpur</option>
                <option value="RNI - Rani Pur">RNI - Rani Pur</option>
                <option value="RTD - Ratto Dero">RTD - Ratto Dero</option>
                <option value="RKT - Rawalakot">RKT - Rawalakot</option>
                <option value="RWP - Rawalpindi">RWP - Rawalpindi</option>
                <option value="RLK - Renala Khurd">RLK - Renala Khurd</option>
                <option value="RSL - Risal Pur">RSL - Risal Pur</option>
                <option value="RSN - Rodu Sultan">RSN - Rodu Sultan</option>
                <option value="RSP - RSP">RSP - RSP</option>
                <option value="RND - Radhan Sultan">RND - Radhan Sultan</option>
                <option value="RAJ - Rajana">RAJ - Rajana</option>
                <option value="RVT - Rawat">RVT - Rawat</option>
                <option value="SDA - Sadiqabad">SDA - Sadiqabad</option>
                <option value="SWL - Sahiwal">SWL - Sahiwal</option>
                <option value="RDU - Sakardu">RDU - Sakardu</option>
                <option value="SAK - Sakrand">SAK - Sakrand</option>
                <option value="SAM - Samandri">SAM - Samandri</option>
                <option value="SND - Sandhilian Wali">SND - Sandhilian Wali</option>
                <option value="SAN - Sanghar">SAN - Sanghar</option>
                <option value="SHL - Sangla Hill">SHL - Sangla Hill</option>
                <option value="SGD - Sarghoda">SGD - Sarghoda</option>
                <option value="SRD - Sarhad">SRD - Sarhad</option>
                <option value="IRS - Sarhari">IRS - Sarhari</option>
                <option value="CSS - Sarwar Shaheed">CSS - Sarwar Shaheed</option>
                <option value="SNG - Seraynorang">SNG - Seraynorang</option>
                <option value="SHH - Shahdad Kot">SHH - Shahdad Kot</option>
                <option value="SPR - Shahdadpur">SPR - Shahdadpur</option>
                <option value="DEE - Shaheed Chowk">DEE - Shaheed Chowk</option>
                <option value="SKT - Shahkot">SKT - Shahkot</option>
                <option value="SAP - Shahpur">SAP - Shahpur</option>
                <option value="SPC - Shahpur Chakar">SPC - Shahpur Chakar</option>
                <option value="SGR - Shakar garah">SGR - Shakar garah</option>
                <option value="SQR - Sharaqpur">SQR - Sharaqpur</option>
                <option value="SRA - Sheikhpura">SRA - Sheikhpura</option>
                <option value="SIP - Shikarpur">SIP - Shikarpur</option>
                <option value="SQT - Shorkot">SQT - Shorkot</option>
                <option value="SHJ - Shujabad">SHJ - Shujabad</option>
                <option value="SLT - Sialkot">SLT - Sialkot</option>
                <option value="SBI - Sibi">SBI - Sibi</option>
                <option value="SJO - Sinjhoro">SJO - Sinjhoro</option>
                <option value="URA - Sorab">URA - Sorab</option>
                <option value="SUI - Sui">SUI - Sui</option>
                <option value="SKZ - Sukkur">SKZ - Sukkur</option>
                <option value="SAL - Sambrial">SAL - Sambrial</option>
                <option value="SUA - Sundar Adda">SUA - Sundar Adda</option>
                <option value="SWA - Swabi">SWA - Swabi</option>
                <option value="RAH - Sadhar">RAH - Sadhar</option>
                <option value="SFD - Sahiwal (FSD)">SFD - Sahiwal (FSD)</option>
                <option value="SRP - Sajanpur">SRP - Sajanpur</option>
                <option value="AMO - Samaro">AMO - Samaro</option>
                <option value="SNW - Sanawan">SNW - Sanawan</option>
                <option value="SBN - Satiana Bangla">SBN - Satiana Bangla</option>
                <option value="SES - Sehwan">SES - Sehwan</option>
                <option value="SQD - Shabqadar">SQD - Shabqadar</option>
                <option value="SSD - Shah Saddar Din">SSD - Shah Saddar Din</option>
                <option value="INA - Shah Saddar Din">INA - Shah Saddar Din</option>
                <option value="ASW - Shawa Adda">ASW - Shawa Adda</option>
                <option value="SNK - Shinkiari">SNK - Shinkiari</option>
                <option value="SMR - SialMore">SMR - SialMore</option>
                <option value="SNL - Silanwali">SNL - Silanwali</option>
                <option value="SIT - Sita Road">SIT - Sita Road</option>
                <option value="SBT - Sohbatpur">SBT - Sohbatpur</option>
                <option value="SAG - Srai Alamgir">SAG - Srai Alamgir</option>
                <option value="SUJ - Sujawal">SUJ - Sujawal</option>
                <option value="EKE - Sukheke">EKE - Sukheke</option>
                <option value="TLG - Talagang">TLG - Talagang</option>
                <option value="TAL - Tall">TAL - Tall</option>
                <option value="TWL - Tandlianwala">TWL - Tandlianwala</option>
                <option value="TDM - Tando Adam">TDM - Tando Adam</option>
                <option value="TDA - Tando Allayar">TDA - Tando Allayar</option>
                <option value="TDJ - Tando Jam">TDJ - Tando Jam</option>
                <option value="TMK - Tando Mohd Khan">TMK - Tando Mohd Khan</option>
                <option value="TAN - Tank">TAN - Tank</option>
                <option value="TRB - Tarbela">TRB - Tarbela</option>
                <option value="TTY - Tatlay Aali">TTY - Tatlay Aali</option>
                <option value="TXL - Taxila">TXL - Taxila</option>
                <option value="TMG - Temargarah">TMG - Temargarah</option>
                <option value="TOK - Thakot">TOK - Thakot</option>
                <option value="TVH - Tharri Mir Wah">TVH - Tharri Mir Wah</option>
                <option value="THT - Thata">THT - Thata</option>
                <option value="TER - Therhi">TER - Therhi</option>
                <option value="THL - Thull">THL - Thull</option>
                <option value="TTS - Toba Tek Singh">TTS - Toba Tek Singh</option>
                <option value="STP - Tool PLaza KHi">STP - Tool PLaza KHi</option>
                <option value="TOP - Topi">TOP - Topi</option>
                <option value="TGA - Trag">TGA - Trag</option>
                <option value="TPM - Trandha m panah">TPM - Trandha m panah</option>
                <option value="TKL - Trarkhel">TKL - Trarkhel</option>
                <option value="TUK - Turbat">TUK - Turbat</option>
                <option value="TEW - Tail Wala">TEW - Tail Wala</option>
                <option value="TBI - Takhat Bai">TBI - Takhat Bai</option>
                <option value="TNG - Tangi">TNG - Tangi</option>
                <option value="IAS - Taunsa Sharif">IAS - Taunsa Sharif</option>
                <option value="TRL - Ternol">TRL - Ternol</option>
                <option value="TSA - Tharo Shah">TSA - Tharo Shah</option>
                <option value="TSP - Tibba Sultan">TSP - Tibba Sultan</option>
                <option value="TRM - Tor Kham">TRM - Tor Kham</option>
                <option value="UCH - UCH Sharif">UCH - UCH Sharif</option>
                <option value="ULI - Uchali">ULI - Uchali</option>
                <option value="UKT - UmerKot">UKT - UmerKot</option>
                <option value="USM - Usta Mohammad">USM - Usta Mohammad</option>
                <option value="URO - Ubaro">URO - Ubaro</option>
                <option value="UPD - Upper Dir">UPD - Upper Dir</option>
                <option value="UTL - Uthal">UTL - Uthal</option>
                <option value="VRI - Vehari">VRI - Vehari</option>
                <option value="VDR - Vari Dir">VDR - Vari Dir</option>
                <option value="WGN - Wagan">WGN - Wagan</option>
                <option value="WAH - Wah">WAH - Wah</option>
                <option value="WNA - Wana">WNA - Wana</option>
                <option value="WZD - Wazirabad">WZD - Wazirabad</option>
                <option value="WBC - Wan Bachran">WBC - Wan Bachran</option>
                <option value="OND - Wando">OND - Wando</option>
                <option value="WNO - Wando">WNO - Wando</option>
                <option value="WRH - Warah">WRH - Warah</option>
                <option value="WDR - Winder">WDR - Winder</option>
                <option value="YZM - Yazman Mandi">YZM - Yazman Mandi</option>
                <option value="ZOB - Zhob">ZOB - Zhob</option>
                <option value="ZRT - Ziarat">ZRT - Ziarat</option>
                <option value="ZFW - Zafarwal">ZFW - Zafarwal</option>
                <option value="ZPR - Zahirpeer">ZPR - Zahirpeer</option>
              </select>
            </div>

            {/* CN Number */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                CN Number
              </label>
              <input
                type="text"
                name="cnNumber"
                value={formData.cnNumber}
                readOnly
                disabled
                placeholder="Auto-Generated on Approval"
                className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 cursor-not-allowed transition-colors"
              />
            </div>

            {/* Pieces */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pieces
              </label>
              <input
                type="number"
                name="pieces"
                value={formData.pieces}
                onChange={handleInputChange}
                placeholder="1"
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
            </div>

            {/* Handling Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Handling Instructions
              </label>
              <select
                name="handlingInstructions"
                value={formData.handlingInstructions}
                onChange={handleInputChange}
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition-colors"
              >
                <option value="">Select Instructions</option>
                {/* Add handling instructions options here */}
              </select>
            </div>

            {/* Packet Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Packet Content <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="packetContent"
                value={formData.packetContent}
                onChange={handleInputChange}
                required
                placeholder="Enter packet contents"
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-5">
            {/* Services */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Services <span className="text-red-500">*</span>
              </label>
              <select
                name="services"
                value={formData.services}
                onChange={handleInputChange}
                required
                disabled={!formData.product || availableServices.length === 0}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  {!formData.product ? 'Select Product First' : availableServices.length === 0 ? 'No services available' : 'Select Service'}
                </option>
                {availableServices.map((service) => (
                  <option key={service.value} value={service.value}>
                    {service.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Pay Mode */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pay Mode <span className="text-red-500">*</span>
              </label>
              <select
                name="payMode"
                value={formData.payMode}
                onChange={handleInputChange}
                required
                disabled={isReadOnly}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 bg-white transition-colors"
              >
                <option value="" disabled>Select Payment Mode</option>
                <option value="Cash">Cash</option>
                <option value="Online">Online</option>
              </select>
            </div>

            {/* Weight/Kg */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Weight/Kg <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="weight"
                value={formData.weight}
                onChange={handleInputChange}
                required
                disabled={isReadOnly}
                placeholder="Enter weight"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Document Selection Section */}
        {documentSection && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-sky-600">{documentSection.heading}</h3>
                <span className="text-sm text-gray-600">
                  {documentSection.documentCount === 0
                    ? 'No documents selected'
                    : `${documentSection.documentCount} document${documentSection.documentCount > 1 ? 's' : ''} selected`}
                </span>
              </div>
              {!isReadOnly && (
                <button
                  type="button"
                  onClick={documentSection.onOpen}
                  className="px-4 py-2 bg-sky-600 text-white rounded-md hover:bg-sky-700 transition-colors font-medium"
                >
                  {documentSection.documentCount > 0 ? 'Edit' : 'Select Documents'}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
