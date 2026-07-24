import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Card,
  CardContent,
  Checkbox,
  FormControlLabel,
  Grid,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import { getLeaveTypes, updateLeaveType } from "../services/api";
import { LeaveType } from "../types";

interface LeaveTypeForm {
  id: string;
  businessUnit: string;
  nameEn: string;
  nameTc: string;
  nameSc: string;
  status: string;
  code: string;
  shortDescription: string;
  hrmsCode: string;

  requireHrVerification: boolean;
  requireComments: boolean;
  cancelRequiresComments: boolean;
  requireExtraApproval: boolean;
  useDottedLineAsSecondApprover: boolean;
  requireExportToHrms: boolean;

  excludeHoliday: boolean;
  allowPostDateApplication: boolean;
  postDateRequiresComment: boolean;
  periodOfServiceMonth: number;
  passProbation: boolean;
  oneTimeOnly: boolean;

  maxAccumulatedDays: number;
  maxWithdrawalDays: number;
  maxDaysPerApplication: number;
  minDaysPerApplication: number;
  defaultLeaveDays: number;
  accumulative: boolean;
  displayBalance: boolean;
  checkEligibility: boolean;

  applicableGender: string;
  administratorOnly: boolean;
  requireSupportingDocument: boolean;

  emailAlertToHr: boolean;
  overdueReminderOffsetHour: number;

  additionalInformation: string;
  policyEnglish: string;
  policyTraditionalChinese: string;
  policySimplifiedChinese: string;

  hrOnlySupportingDocuments: boolean;
  timeOffIntegrated: boolean;
  exportToHrms: boolean;
}

function mapLeaveTypeToForm(x: LeaveType): LeaveTypeForm {
  return {
    id: x.id,
    businessUnit: "Hong Kong Terminal",
    nameEn: x.nameEn,
    nameTc: x.nameTc ?? "",
    nameSc: x.nameSc ?? "",
    status: x.isActive ? "Active" : "Inactive",
    code: x.code,
    shortDescription: "",
    hrmsCode: "",

    requireHrVerification: x.requireHrVerification,
    requireComments: x.requireComments,
    cancelRequiresComments: false,
    requireExtraApproval: false,
    useDottedLineAsSecondApprover: false,
    requireExportToHrms: false,

    excludeHoliday: x.excludeHoliday,
    allowPostDateApplication: x.allowPostDateApplication,
    postDateRequiresComment: x.allowPostDateApplication,
    periodOfServiceMonth: 0,
    passProbation: false,
    oneTimeOnly: false,

    maxAccumulatedDays: 30,
    maxWithdrawalDays: 10,
    maxDaysPerApplication: x.maxDaysPerApplication,
    minDaysPerApplication: x.minDaysPerApplication,
    defaultLeaveDays: 1,
    accumulative: false,
    displayBalance: true,
    checkEligibility: true,

    applicableGender: "All",
    administratorOnly: false,
    requireSupportingDocument: x.requireSupportingDocument,

    emailAlertToHr: false,
    overdueReminderOffsetHour: 24,

    additionalInformation: "",
    policyEnglish: "",
    policyTraditionalChinese: "",
    policySimplifiedChinese: "",

    hrOnlySupportingDocuments: false,
    timeOffIntegrated: true,
    exportToHrms: false,
  };
}

export function LeaveTypeMaintenancePage() {
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [form, setForm] = useState<LeaveTypeForm | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLeaveTypes();
        setLeaveTypes(data);
        if (data[0]) {
          setSelectedId(data[0].id);
          setForm(mapLeaveTypeToForm(data[0]));
        }
      } catch {
        setError("Unable to load leave type configuration.");
      }
    };

    void load();
  }, []);

  useEffect(() => {
    if (!selectedId) {
      return;
    }

    const selected = leaveTypes.find((x) => x.id === selectedId);
    if (selected) {
      setForm(mapLeaveTypeToForm(selected));
    }
  }, [selectedId, leaveTypes]);

  const aiSuggestion = useMemo(() => {
    if (!form) {
      return "";
    }

    if (form.allowPostDateApplication) {
      return "This leave type allows post-date applications. Suggested settings: Require comments = Enabled, HR verification = Enabled.";
    }

    return "No special post-date risk found. Standard approval flow is sufficient.";
  }, [form]);

  const update = <K extends keyof LeaveTypeForm>(key: K, value: LeaveTypeForm[K]) => {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const save = async () => {
    if (!form) {
      return;
    }

    setMessage("");
    setError("");

    try {
      await updateLeaveType({
        id: form.id,
        code: form.code,
        nameEn: form.nameEn,
        nameTc: form.nameTc,
        nameSc: form.nameSc,
        requireHrVerification: form.requireHrVerification,
        requireComments: form.requireComments,
        excludeHoliday: form.excludeHoliday,
        allowPostDateApplication: form.allowPostDateApplication,
        requireSupportingDocument: form.requireSupportingDocument,
        minDaysPerApplication: form.minDaysPerApplication,
        maxDaysPerApplication: form.maxDaysPerApplication,
        isActive: form.status === "Active",
      });

      setMessage("Leave type settings updated.");
    } catch {
      setError("Unable to save leave type settings.");
    }
  };

  if (!form) {
    return <Typography>Loading leave type settings...</Typography>;
  }

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <Typography variant="h5" fontWeight={800}>
          Leave Type Maintenance
        </Typography>
      </Grid>

      <Grid item xs={12} md={4}>
        <Card>
          <CardContent>
            <TextField
              fullWidth
              select
              label="Leave Type"
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
            >
              {leaveTypes.map((x) => (
                <MenuItem key={x.id} value={x.id}>
                  {x.nameEn} ({x.code})
                </MenuItem>
              ))}
            </TextField>
            <Alert sx={{ mt: 2 }} severity="info">
              {aiSuggestion}
            </Alert>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={8}>
        <Card>
          <CardContent>
            <Stack spacing={2}>
              {message && <Alert severity="success">{message}</Alert>}
              {error && <Alert severity="error">{error}</Alert>}

              <Typography variant="h6" fontWeight={700}>
                Basic Information
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="ID" value={form.id} disabled />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Business Unit"
                    value={form.businessUnit}
                    onChange={(e) => update("businessUnit", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField fullWidth label="Code" value={form.code} onChange={(e) => update("code", e.target.value)} />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Leave Type Name (English)"
                    value={form.nameEn}
                    onChange={(e) => update("nameEn", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Leave Type Name (Traditional Chinese)"
                    value={form.nameTc}
                    onChange={(e) => update("nameTc", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Leave Type Name (Simplified Chinese)"
                    value={form.nameSc}
                    onChange={(e) => update("nameSc", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Status"
                    value={form.status}
                    onChange={(e) => update("status", e.target.value)}
                  >
                    <MenuItem value="Active">Active</MenuItem>
                    <MenuItem value="Inactive">Inactive</MenuItem>
                  </TextField>
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Short Description"
                    value={form.shortDescription}
                    onChange={(e) => update("shortDescription", e.target.value)}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="HRMS Code"
                    value={form.hrmsCode}
                    onChange={(e) => update("hrmsCode", e.target.value)}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" fontWeight={700}>
                Approval and Date Rules
              </Typography>
              <Grid container spacing={1}>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.requireHrVerification}
                        onChange={(e) => update("requireHrVerification", e.target.checked)}
                      />
                    }
                    label="Require HR Verification"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.requireComments}
                        onChange={(e) => update("requireComments", e.target.checked)}
                      />
                    }
                    label="Require Comments"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.cancelRequiresComments}
                        onChange={(e) => update("cancelRequiresComments", e.target.checked)}
                      />
                    }
                    label="Cancel Requires Comments"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.requireExtraApproval}
                        onChange={(e) => update("requireExtraApproval", e.target.checked)}
                      />
                    }
                    label="Require Extra Approval"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.useDottedLineAsSecondApprover}
                        onChange={(e) => update("useDottedLineAsSecondApprover", e.target.checked)}
                      />
                    }
                    label="Use Dotted Line as Second Approver"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.requireExportToHrms}
                        onChange={(e) => update("requireExportToHrms", e.target.checked)}
                      />
                    }
                    label="Require Export to HRMS"
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={<Checkbox checked={form.excludeHoliday} onChange={(e) => update("excludeHoliday", e.target.checked)} />}
                    label="Exclude Holiday"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.allowPostDateApplication}
                        onChange={(e) => update("allowPostDateApplication", e.target.checked)}
                      />
                    }
                    label="Allow Post Date Application"
                  />
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={form.postDateRequiresComment}
                        onChange={(e) => update("postDateRequiresComment", e.target.checked)}
                      />
                    }
                    label="Post Date Requires Comment"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.passProbation} onChange={(e) => update("passProbation", e.target.checked)} />}
                    label="Pass Probation"
                  />
                  <FormControlLabel
                    control={<Checkbox checked={form.oneTimeOnly} onChange={(e) => update("oneTimeOnly", e.target.checked)} />}
                    label="One Time Only"
                  />

                  <TextField
                    fullWidth
                    type="number"
                    size="small"
                    label="Period of Service (Month)"
                    value={form.periodOfServiceMonth}
                    onChange={(e) => update("periodOfServiceMonth", Number(e.target.value))}
                    sx={{ mt: 1 }}
                  />
                </Grid>
              </Grid>

              <Typography variant="h6" fontWeight={700}>
                Leave Rules and Restrictions
              </Typography>
              <Grid container spacing={1}>
                {[
                  ["Max Accumulated Days", form.maxAccumulatedDays, "maxAccumulatedDays"],
                  ["Max Withdrawal Days", form.maxWithdrawalDays, "maxWithdrawalDays"],
                  ["Max Days Per Application", form.maxDaysPerApplication, "maxDaysPerApplication"],
                  ["Min Days Per Application", form.minDaysPerApplication, "minDaysPerApplication"],
                  ["Default Leave Days", form.defaultLeaveDays, "defaultLeaveDays"],
                  ["Overdue Reminder Offset (Hour)", form.overdueReminderOffsetHour, "overdueReminderOffsetHour"],
                ].map(([label, value, key]) => (
                  <Grid item xs={12} md={4} key={String(key)}>
                    <TextField
                      fullWidth
                      type="number"
                      label={String(label)}
                      value={Number(value)}
                      onChange={(e) => update(key as keyof LeaveTypeForm, Number(e.target.value) as never)}
                    />
                  </Grid>
                ))}

                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    select
                    label="Applicable Gender"
                    value={form.applicableGender}
                    onChange={(e) => update("applicableGender", e.target.value)}
                  >
                    <MenuItem value="All">All</MenuItem>
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                  </TextField>
                </Grid>

                <Grid item xs={12} md={8}>
                  <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                    <FormControlLabel
                      control={<Checkbox checked={form.accumulative} onChange={(e) => update("accumulative", e.target.checked)} />}
                      label="Accumulative"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={form.displayBalance} onChange={(e) => update("displayBalance", e.target.checked)} />}
                      label="Display Balance"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={form.checkEligibility} onChange={(e) => update("checkEligibility", e.target.checked)} />}
                      label="Check Eligibility"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox checked={form.administratorOnly} onChange={(e) => update("administratorOnly", e.target.checked)} />
                      }
                      label="Administrator Only"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.requireSupportingDocument}
                          onChange={(e) => update("requireSupportingDocument", e.target.checked)}
                        />
                      }
                      label="Require Supporting Document"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={form.emailAlertToHr} onChange={(e) => update("emailAlertToHr", e.target.checked)} />}
                      label="Email Alert to HR"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={form.hrOnlySupportingDocuments}
                          onChange={(e) => update("hrOnlySupportingDocuments", e.target.checked)}
                        />
                      }
                      label="HR-Only Supporting Documents"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox checked={form.timeOffIntegrated} onChange={(e) => update("timeOffIntegrated", e.target.checked)} />
                      }
                      label="Time-Off Integrated"
                    />
                    <FormControlLabel
                      control={<Checkbox checked={form.exportToHrms} onChange={(e) => update("exportToHrms", e.target.checked)} />}
                      label="Export to HRMS"
                    />
                  </Stack>
                </Grid>
              </Grid>

              <Typography variant="h6" fontWeight={700}>
                Additional Information and Policy
              </Typography>
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Additional Information"
                value={form.additionalInformation}
                onChange={(e) => update("additionalInformation", e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Policy English"
                value={form.policyEnglish}
                onChange={(e) => update("policyEnglish", e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Policy Traditional Chinese"
                value={form.policyTraditionalChinese}
                onChange={(e) => update("policyTraditionalChinese", e.target.value)}
              />
              <TextField
                fullWidth
                multiline
                minRows={2}
                label="Policy Simplified Chinese"
                value={form.policySimplifiedChinese}
                onChange={(e) => update("policySimplifiedChinese", e.target.value)}
              />

              <Button variant="contained" onClick={() => void save()}>
                Save Leave Type
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}

