"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core = __importStar(require("@actions/core"));
const github = __importStar(require("@actions/github"));
const glob = __importStar(require("@actions/glob"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const got_1 = require("got");
// eslint-disable-next-line require-jsdoc
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        const auth = core.getInput('server-auth', { required: true });
        const serverUrl = new URL(core.getInput('server-url', { required: true }));
        const reportPath = core.getInput('path', { required: true });
        const globber = yield glob.create(path_1.default.join(reportPath, '*.junit'));
        const results = yield globber.glob();
        const endpointUrl = new URL('uploads', serverUrl);
        if (results.length === 0) {
            throw new Error(`Could not find any files matching '*.junit' in ${reportPath}`);
        }
        for (const [i, file] of results.entries()) {
            const data = fs_1.default.readFileSync(file);
            const b64 = Buffer.from(data).toString('base64');
            const owner = github.context.repo.owner;
            const githubRepository = owner + '/' + github.context.repo.repo;
            const body = {
                junit_report_xml: b64,
                github_repository: githubRepository,
                github_sha: github.context.sha,
                github_ref_name: process.env.GITHUB_REF_NAME,
                github_action: github.context.action,
                github_run_number: github.context.runNumber,
                github_run_attempt: process.env.GITHUB_RUN_ATTEMPT,
                github_run_id: github.context.runId.toString(),
                github_job: github.context.job,
                github_retention_days: process.env.GITHUB_RETENTION_DAYS,
                iteration: i + 1,
                github_base_ref: process.env.GITHUB_BASE_REF || null,
                github_head_ref: process.env.GITHUB_HEAD_REF || null,
            };
            const headers = {
                'Test-Observability-Auth-Key': auth,
            };
            const response = yield got_1.got.post(endpointUrl.toString(), {
                headers,
                json: body,
            });
            if (response.statusCode < 200 || response.statusCode > 299) {
                console.log('Uploading test results failed:');
                const msg = 'Server returned code ' + response.statusCode;
                console.log(msg);
                console.log(response.body);
                core.setFailed(msg);
                return;
            }
            const upload = JSON.parse(response.body);
            const uploadUrlPath = path_1.default.join('repos', githubRepository, 'uploads', upload.id);
            const uploadUrl = new URL(uploadUrlPath, serverUrl);
            console.log(`Test results uploaded successfully: ${uploadUrl}`);
        }
        ;
    });
}
main().catch((err) => {
    core.setFailed(err.message);
});
