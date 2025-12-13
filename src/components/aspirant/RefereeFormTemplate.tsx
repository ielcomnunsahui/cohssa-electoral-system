import ISECOLogo from "@/assets/ISECO_LOGO.png";

interface RefereeFormData {
  full_name?: string;
  matric?: string;
  department?: string;
  level?: string;
  date_of_birth?: string;
  gender?: string;
  phone?: string;
  position_name?: string;
}

export const generateRefereeFormHTML = (data: RefereeFormData): string => {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>AHSS ISECO REFEREE FORM</title>
<style>
    body {
        font-family: Arial, sans-serif;
        margin: 0;
        padding: 40px;
        font-size: 14px;
        background: #f9f9f9;
    }

    .document {
        background: white;
        padding: 30px 40px;
        border: 1px solid #ddd;
        border-radius: 6px;
        max-width: 900px;
        margin: auto;
    }

    .header {
        display: flex;
        align-items: center;
        gap: 15px;
        margin-bottom: 10px;
    }

    .logo {
        width: 70px;
        height: 70px;
        object-fit: contain;
        border-radius: 50%;
        border: 1px solid #ccc;
        padding: 3px;
    }

    .header-text h1 {
        font-size: 22px;
        margin: 0;
        font-weight: bold;
        text-transform: uppercase;
    }

    .header-text p {
        font-size: 12px;
        margin: 0;
        color: #555;
        letter-spacing: 0.3px;
    }

    .title {
        text-align: center;
        margin: 25px 0;
        font-size: 20px;
        font-weight: bold;
        text-decoration: underline;
    }

    h2 {
        font-size: 15px;
        margin-bottom: 8px;
        padding-bottom: 4px;
        border-bottom: 1px solid #222;
    }

    .section {
        margin-bottom: 25px;
    }

    .field {
        margin-bottom: 10px;
        display: flex;
        align-items: baseline;
    }

    .label {
        font-weight: bold;
        min-width: 180px;
    }

    .underline {
        flex-grow: 1;
        border-bottom: 1px solid #000;
        min-height: 18px;
        padding-left: 4px;
    }

    .inline-group {
        display: flex;
        gap: 20px;
    }

    .referee-area {
        border: 1px solid #aaa;
        padding: 15px;
        border-radius: 4px;
        background: #fafafa;
    }

    .referee-comment {
        border: 1px dashed #aaa;
        min-height: 80px;
        margin-top: 5px;
        padding: 8px;
        background: #fff;
    }

    .note {
        font-size: 12px;
        margin-top: 10px;
        font-style: italic;
        color: #444;
    }

    @media print {
        body {
            background: white;
            padding: 0;
        }
        .document {
            border: none;
            padding: 20px;
        }
    }
</style>
</head>

<body>
<div class="document">
    <div class="header">
        <img src="${ISECOLogo}" alt="AHSS ISECO Logo" class="logo" />
        <div class="header-text">
            <h1>AHSS ISECO</h1>
            <p>Al-Hikmah University Chapter</p>
        </div>
    </div>
    <div class="title">AHSS ISECO REFEREE FORM</div>
    <div class="section">
        <h2>1. PERSONAL INFORMATION</h2>
        <div class="field">
            <span class="label">Full Name:</span>
            <span class="underline">${data.full_name || ""}</span>
        </div>
        <div class="inline-group">
            <div class="field" style="width: 50%;">
                <span class="label">Matric Number:</span>
                <span class="underline">${data.matric || ""}</span>
            </div>

            <div class="field" style="width: 50%;">
                <span class="label">Department:</span>
                <span class="underline">${data.department || ""}</span>
            </div>
        </div>

        <div class="inline-group">
            <div class="field" style="width: 50%;">
                <span class="label">Level of Study:</span>
                <span class="underline">${data.level || ""}</span>
            </div>

            <div class="field" style="width: 50%;">
                <span class="label">Date of Birth:</span>
                <span class="underline">${data.date_of_birth || ""}</span>
            </div>
        </div>

        <div class="inline-group">
            <div class="field" style="width: 50%;">
                <span class="label">Gender:</span>
                <span class="underline">${data.gender || ""}</span>
            </div>

            <div class="field" style="width: 50%;">
                <span class="label">Phone Number:</span>
                <span class="underline">${data.phone || ""}</span>
            </div>
        </div>
    </div>

    <div class="section">
        <h2>2. POSITION CONTESTING FOR</h2>
        <div class="field">
            <span class="label">Desired Position:</span>
            <span class="underline">${data.position_name || ""}</span>
        </div>
    </div>

    <div class="section">
        <h2>3. REFEREE</h2>
        <div class="referee-area">
            <div class="inline-group">
                <div class="field" style="width: 50%;">
                    <span class="label">Name:</span>
                    <span class="underline"></span>
                </div>
                <div class="field" style="width: 50%;">
                    <span class="label">Phone:</span>
                    <span class="underline"></span>
                </div>
            </div>
            <div class="inline-group">
                <div class="field" style="width: 50%;">
                    <span class="label">Signature:</span>
                    <span class="underline"></span>
                </div>
                <div class="field" style="width: 50%;">
                    <span class="label">Date:</span>
                    <span class="underline"></span>
                </div>
            </div>
            <div class="field" style="flex-direction: column;">
                <span class="label" style="min-width: unset;">Referee Comments:</span>
                <div class="referee-comment"></div>
            </div>
            <p class="note">
                Note: A referee must be an Academic staff in the College of Health Sciences, Al-Hikmah University, Ilorin.
            </p>
        </div>
    </div>
</div>
</body>
</html>`;
};
